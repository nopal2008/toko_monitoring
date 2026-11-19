<?php

namespace App\Services;

use App\Jobs\CheckLowStockJob;
use App\Models\CashierShift;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Store;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\TransactionPayment;
use App\Models\User;
use App\Support\MoneyAmount;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateTransactionService
{
    public function __construct(private readonly PosPricingService $pricing) {}

    /**
     * @param  array{
     *     store_id: int,
     *     items: array<int, array{product_id: int, quantity: int, discount_amount?: string|int|null}>,
     *     payments?: array<int, array{method: string, amount: string|int, reference_number?: string|null}>,
     *     discount_amount?: string|int|null,
     *     tax_amount?: string|int|null,
     *     paid_amount?: string|int|null,
     *     payment_method?: string|null,
     *     cashier_shift_id?: int|null,
     *     notes?: string|null
     * } $data
     */
    public function create(User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $data): Transaction {
            $tenantId = (int) $user->tenant_id;
            $storeId = (int) $data['store_id'];
            $store = Store::query()->lockForUpdate()->findOrFail($storeId);
            $shiftId = $data['cashier_shift_id'] ?? null;

            if ($shiftId !== null) {
                CashierShift::query()
                    ->whereKey($shiftId)
                    ->where('store_id', $storeId)
                    ->where('user_id', $user->id)
                    ->where('status', 'open')
                    ->firstOrFail();
            }

            $productIds = collect($data['items'])->pluck('product_id')->unique()->sort()->values();
            $products = Product::query()->whereIn('id', $productIds)->get()->keyBy('id');
            $inventories = Inventory::query()
                ->where('store_id', $storeId)
                ->whereIn('product_id', $productIds)
                ->orderBy('product_id')
                ->lockForUpdate()
                ->get()
                ->keyBy('product_id');

            $pricing = $this->pricing->quote(
                $tenantId,
                $storeId,
                $data['items'],
                $products,
                $inventories,
                $data['discount_amount'] ?? null,
                $data['tax_amount'] ?? null,
            );

            $payments = $this->normalizePayments($data);
            $paid = array_sum(array_column($payments, 'amount'));
            $total = $pricing['total'];

            if ($paid < $total) {
                throw ValidationException::withMessages([
                    'payments' => 'Jumlah pembayaran kurang dari total transaksi.',
                ]);
            }

            $primaryMethod = count($payments) > 1 ? 'split' : $payments[0]['method'];
            $prefix = $store->code.'-'.now()->format('Ymd').'-';
            $latestInvoice = Transaction::query()
                ->where('store_id', $storeId)
                ->where('invoice_number', 'like', $prefix.'%')
                ->orderByDesc('invoice_number')
                ->lockForUpdate()
                ->value('invoice_number');
            $sequence = $latestInvoice === null ? 1 : ((int) substr($latestInvoice, -6)) + 1;
            $invoiceNumber = $prefix.str_pad((string) $sequence, 6, '0', STR_PAD_LEFT);

            $transaction = Transaction::query()->create([
                'tenant_id' => $tenantId,
                'store_id' => $storeId,
                'cashier_shift_id' => $shiftId,
                'invoice_number' => $invoiceNumber,
                'user_id' => $user->id,
                'subtotal_amount' => MoneyAmount::fromMinorUnits($pricing['subtotal']),
                'discount_amount' => MoneyAmount::fromMinorUnits($pricing['discount']),
                'tax_amount' => MoneyAmount::fromMinorUnits($pricing['tax']),
                'total_amount' => MoneyAmount::fromMinorUnits($total),
                'paid_amount' => MoneyAmount::fromMinorUnits($paid),
                'change_amount' => MoneyAmount::fromMinorUnits($paid - $total),
                'payment_method' => $primaryMethod,
                'status' => 'completed',
                'notes' => $data['notes'] ?? null,
                'completed_at' => now(),
            ]);

            foreach ($payments as $payment) {
                TransactionPayment::query()->create([
                    'transaction_id' => $transaction->id,
                    'method' => $payment['method'],
                    'amount' => MoneyAmount::fromMinorUnits($payment['amount']),
                    'reference_number' => $payment['reference_number'] ?? null,
                    'paid_at' => now(),
                ]);
            }

            foreach ($pricing['items'] as $snapshot) {
                $product = $snapshot['product'];
                $inventory = $snapshot['inventory'];
                $quantityBefore = $inventory->quantity;
                $quantityAfter = $quantityBefore - $snapshot['quantity'];

                TransactionItem::query()->create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $snapshot['quantity'],
                    'price' => MoneyAmount::fromMinorUnits($snapshot['unit_price']),
                    'cost_price' => $product->cost_price,
                    'discount_amount' => MoneyAmount::fromMinorUnits($snapshot['discount']),
                    'subtotal' => MoneyAmount::fromMinorUnits($snapshot['subtotal']),
                ]);

                $inventory->forceFill([
                    'quantity' => $quantityAfter,
                    'last_movement_at' => now(),
                ])->save();

                StockMovement::query()->create([
                    'tenant_id' => $tenantId,
                    'store_id' => $storeId,
                    'product_id' => $product->id,
                    'type' => 'sale',
                    'quantity' => -$snapshot['quantity'],
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $quantityAfter,
                    'unit_cost' => $product->cost_price,
                    'reference_type' => Transaction::class,
                    'reference_id' => $transaction->id,
                    'created_by' => $user->id,
                ]);

                CheckLowStockJob::dispatch($tenantId, $storeId, (int) $product->id)
                    ->onQueue('notifications')
                    ->afterCommit();
            }

            return $transaction->load(['items', 'payments', 'store', 'cashier']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<int, array{method: string, amount: int, reference_number: string|null}>
     */
    private function normalizePayments(array $data): array
    {
        $payments = $data['payments'] ?? [];

        if ($payments === []) {
            $method = isset($data['payment_method']) && is_string($data['payment_method'])
                ? $data['payment_method']
                : 'cash';
            $amount = $data['paid_amount'] ?? null;

            if ($amount === null) {
                throw ValidationException::withMessages([
                    'payments' => 'Rincian pembayaran wajib diisi.',
                ]);
            }

            return [[
                'method' => $method,
                'amount' => MoneyAmount::toMinorUnits($amount),
                'reference_number' => null,
            ]];
        }

        return array_map(function (array $payment): array {
            return [
                'method' => (string) $payment['method'],
                'amount' => MoneyAmount::toMinorUnits($payment['amount']),
                'reference_number' => $payment['reference_number'] ?? null,
            ];
        }, $payments);
    }
}
