<?php

namespace App\Services;

use App\Jobs\CheckLowStockJob;
use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\StockTransfer;
use App\Models\StockTransferItem;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StockTransferService
{
    /**
     * @param array{from_store_id: int, to_store_id: int, items: array<int, array{product_id: int, quantity: int}>, notes?: string|null} $data
     */
    public function create(User $user, array $data): StockTransfer
    {
        return DB::transaction(function () use ($user, $data): StockTransfer {
            $fromStoreId = (int) $data['from_store_id'];
            $toStoreId = (int) $data['to_store_id'];

            if ($fromStoreId === $toStoreId) {
                throw ValidationException::withMessages([
                    'to_store_id' => 'Cabang tujuan harus berbeda dari cabang asal.',
                ]);
            }

            Store::query()->findOrFail($fromStoreId);
            Store::query()->findOrFail($toStoreId);
            $productIds = collect($data['items'])->pluck('product_id')->unique()->sort()->values();
            $existingProductIds = DB::table('products')
                ->where('tenant_id', $user->tenant_id)
                ->whereIn('id', $productIds)
                ->pluck('id');

            if ($existingProductIds->count() !== $productIds->count()) {
                throw ValidationException::withMessages([
                    'items' => 'Semua produk harus berasal dari tenant Anda.',
                ]);
            }

            $transfer = StockTransfer::query()->create([
                'tenant_id' => $user->tenant_id,
                'code' => 'TRF-'.now()->format('Ymd').'-'.Str::upper(Str::random(8)),
                'from_store_id' => $fromStoreId,
                'to_store_id' => $toStoreId,
                'status' => 'pending',
                'notes' => $data['notes'] ?? null,
                'requested_by' => $user->id,
            ]);

            foreach ($data['items'] as $item) {
                StockTransferItem::query()->create([
                    'stock_transfer_id' => $transfer->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'received_quantity' => 0,
                ]);
            }

            return $transfer->load('items.product:id,name,sku');
        });
    }

    public function approve(StockTransfer $transfer, User $user): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $user): StockTransfer {
            $transfer = $this->lockTransfer($transfer);
            $this->assertStatus($transfer, 'pending');

            $transfer->forceFill([
                'status' => 'approved',
                'approved_by' => $user->id,
                'approved_at' => now(),
            ])->save();

            return $transfer;
        });
    }

    public function ship(StockTransfer $transfer, User $user): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $user): StockTransfer {
            $transfer = $this->lockTransfer($transfer);
            $this->assertStatus($transfer, 'approved');
            $items = $transfer->items()->orderBy('product_id')->get();

            foreach ($items as $item) {
                $inventory = Inventory::query()
                    ->where('store_id', $transfer->from_store_id)
                    ->where('product_id', $item->product_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($inventory->quantity - $inventory->reserved_quantity < $item->quantity) {
                    throw ValidationException::withMessages([
                        'transfer' => 'Stok cabang asal tidak mencukupi untuk pengiriman.',
                    ]);
                }

                $quantityBefore = $inventory->quantity;
                $quantityAfter = $quantityBefore - $item->quantity;
                $inventory->forceFill(['quantity' => $quantityAfter, 'last_movement_at' => now()])->save();
                $this->recordMovement($transfer, $item->product_id, -$item->quantity, $quantityBefore, $quantityAfter, $user);
                CheckLowStockJob::dispatch(
                    (int) $transfer->tenant_id,
                    (int) $transfer->from_store_id,
                    (int) $item->product_id,
                )->onQueue('notifications')->afterCommit();
            }

            $transfer->forceFill(['status' => 'in_transit'])->save();

            return $transfer;
        });
    }

    /**
     * @param array<int, array{stock_transfer_item_id: int, received_quantity: int}> $receivedItems
     */
    public function complete(StockTransfer $transfer, array $receivedItems, User $user): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $receivedItems, $user): StockTransfer {
            $transfer = $this->lockTransfer($transfer);
            $this->assertStatus($transfer, 'in_transit');
            $items = $transfer->items()->orderBy('product_id')->lockForUpdate()->get()->keyBy('id');

            if (count($receivedItems) !== $items->count()) {
                throw ValidationException::withMessages([
                    'items' => 'Jumlah yang diterima harus diberikan untuk setiap item transfer.',
                ]);
            }

            foreach ($receivedItems as $receivedItem) {
                $item = $items->get($receivedItem['stock_transfer_item_id']);

                if ($item === null || $receivedItem['received_quantity'] > $item->quantity) {
                    throw ValidationException::withMessages([
                        'items' => 'Jumlah diterima tidak valid untuk item transfer.',
                    ]);
                }

                $item->forceFill(['received_quantity' => $receivedItem['received_quantity']])->save();
            }

            foreach ($items as $item) {
                $destinationInventory = Inventory::query()
                    ->where('store_id', $transfer->to_store_id)
                    ->where('product_id', $item->product_id)
                    ->lockForUpdate()
                    ->first();

                if ($destinationInventory === null) {
                    $destinationInventory = Inventory::query()->create([
                        'tenant_id' => $transfer->tenant_id,
                        'store_id' => $transfer->to_store_id,
                        'product_id' => $item->product_id,
                        'quantity' => 0,
                    ]);
                }

                $quantityBefore = $destinationInventory->quantity;
                $quantityAfter = $quantityBefore + $item->received_quantity;
                $destinationInventory->forceFill([
                    'quantity' => $quantityAfter,
                    'last_movement_at' => now(),
                ])->save();
                $this->recordMovement($transfer, $item->product_id, $item->received_quantity, $quantityBefore, $quantityAfter, $user, $transfer->to_store_id, 'transfer_in');
            }

            $transfer->forceFill(['status' => 'completed', 'completed_at' => now()])->save();

            return $transfer->load('items');
        });
    }

    public function cancel(StockTransfer $transfer, User $user): StockTransfer
    {
        return DB::transaction(function () use ($transfer, $user): StockTransfer {
            $transfer = $this->lockTransfer($transfer);

            if (! in_array($transfer->status, ['pending', 'approved', 'in_transit'], true)) {
                throw ValidationException::withMessages(['transfer' => 'Transfer tidak dapat dibatalkan pada status ini.']);
            }

            if ($transfer->status === 'in_transit') {
                foreach ($transfer->items as $item) {
                    $inventory = Inventory::query()
                        ->where('store_id', $transfer->from_store_id)
                        ->where('product_id', $item->product_id)
                        ->lockForUpdate()
                        ->firstOrFail();
                    $quantityBefore = $inventory->quantity;
                    $quantityAfter = $quantityBefore + $item->quantity;
                    $inventory->forceFill(['quantity' => $quantityAfter, 'last_movement_at' => now()])->save();
                    $this->recordMovement($transfer, $item->product_id, $item->quantity, $quantityBefore, $quantityAfter, $user, $transfer->from_store_id, 'transfer_return');
                }
            }

            $transfer->forceFill(['status' => 'cancelled', 'cancelled_at' => now()])->save();

            return $transfer;
        });
    }

    private function lockTransfer(StockTransfer $transfer): StockTransfer
    {
        return StockTransfer::query()->with('items')->lockForUpdate()->findOrFail($transfer->id);
    }

    private function assertStatus(StockTransfer $transfer, string $status): void
    {
        if ($transfer->status !== $status) {
            throw ValidationException::withMessages([
                'transfer' => 'Status transfer tidak mengizinkan aksi ini.',
            ]);
        }
    }

    private function recordMovement(
        StockTransfer $transfer,
        int $productId,
        int $quantity,
        int $quantityBefore,
        int $quantityAfter,
        User $user,
        ?int $storeId = null,
        string $type = 'transfer_out',
    ): void {
        if ($quantity === 0) {
            return;
        }

        StockMovement::query()->create([
            'tenant_id' => $transfer->tenant_id,
            'store_id' => $storeId ?? $transfer->from_store_id,
            'product_id' => $productId,
            'type' => $type,
            'quantity' => $quantity,
            'quantity_before' => $quantityBefore,
            'quantity_after' => $quantityAfter,
            'reference_type' => StockTransfer::class,
            'reference_id' => $transfer->id,
            'created_by' => $user->id,
        ]);
    }
}
