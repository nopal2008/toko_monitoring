<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\StockMovement;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    /**
     * @param  array{
     *     store_id: int,
     *     supplier_id?: int|null,
     *     purchase_date?: string,
     *     status?: string,
     *     notes?: string|null,
     *     items?: array<int, array{product_id: int, quantity: int, unit_cost: string|int|null}>
     * } $data
     */
    public function create(User $user, array $data): Purchase
    {
        return DB::transaction(function () use ($user, $data): Purchase {
            $store = Store::query()->lockForUpdate()->findOrFail((int) $data['store_id']);
            $purchase = Purchase::query()->create([
                'tenant_id' => $user->tenant_id,
                'store_id' => $store->id,
                'supplier_id' => isset($data['supplier_id']) ? (int) $data['supplier_id'] : null,
                'invoice_number' => $this->invoiceNumber($store->id),
                'purchase_date' => $data['purchase_date'] ?? now()->toDateString(),
                'total_amount' => '0.00',
                'status' => $data['status'] ?? 'draft',
                'notes' => $data['notes'] ?? null,
                'created_by' => $user->id,
            ]);

            $total = 0.0;

            foreach ($data['items'] ?? [] as $item) {
                $quantity = (int) $item['quantity'];
                $unitCost = (float) $item['unit_cost'];
                $subtotal = (float) $quantity * $unitCost;

                PurchaseItem::query()->create([
                    'purchase_id' => $purchase->id,
                    'product_id' => (int) $item['product_id'],
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'subtotal' => $subtotal,
                ]);

                $total += $subtotal;
            }

            $purchase->forceFill([
                'total_amount' => number_format($total, 2, '.', ''),
            ])->save();

            if ($purchase->status === 'completed') {
                $this->receive($purchase, $user);
            }

            return $purchase->fresh(['items.product']);
        });
    }

    public function receive(Purchase $purchase, User $user): Purchase
    {
        return DB::transaction(function () use ($purchase, $user): Purchase {
            $lockedPurchase = Purchase::query()->lockForUpdate()->findOrFail($purchase->id);

            $lockedPurchase->forceFill([
                'status' => 'completed',
                'received_at' => now(),
            ])->save();

            foreach ($lockedPurchase->items as $item) {
                $inventory = Inventory::query()
                    ->where('store_id', $lockedPurchase->store_id)
                    ->where('product_id', $item->product_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $quantityBefore = $inventory->quantity;
                $quantityAfter = $quantityBefore + $item->quantity;

                $inventory->forceFill([
                    'quantity' => $quantityAfter,
                    'last_movement_at' => now(),
                ])->save();

                StockMovement::query()->create([
                    'tenant_id' => $lockedPurchase->tenant_id,
                    'store_id' => $lockedPurchase->store_id,
                    'product_id' => $item->product_id,
                    'type' => 'purchase',
                    'quantity' => $item->quantity,
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $quantityAfter,
                    'unit_cost' => $item->unit_cost,
                    'reference_type' => Purchase::class,
                    'reference_id' => $lockedPurchase->id,
                    'created_by' => $user->id,
                ]);
            }

            return $lockedPurchase->fresh();
        });
    }

    private function invoiceNumber(int $storeId): string
    {
        $prefix = 'PO-'.now()->format('Ymd').'-';

        $latestInvoice = Purchase::query()
            ->where('invoice_number', 'like', $prefix.'%')
            ->orderByDesc('invoice_number')
            ->lockForUpdate()
            ->value('invoice_number');

        $sequence = $latestInvoice === null ? 1 : ((int) substr($latestInvoice, -4)) + 1;

        return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
