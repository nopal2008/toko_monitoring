<?php

namespace App\Services;

use App\Jobs\CheckLowStockJob;
use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdjustInventoryService
{
    /**
     * @param array{store_id: int, product_id: int, quantity_change: int, reason: string} $data
     */
    public function adjust(User $user, array $data): Inventory
    {
        return DB::transaction(function () use ($user, $data): Inventory {
            $inventory = Inventory::query()
                ->where('store_id', $data['store_id'])
                ->where('product_id', $data['product_id'])
                ->lockForUpdate()
                ->firstOrFail();
            $quantityBefore = $inventory->quantity;
            $quantityAfter = $quantityBefore + $data['quantity_change'];

            if ($quantityAfter < 0) {
                throw ValidationException::withMessages([
                    'quantity_change' => 'Penyesuaian tidak boleh membuat stok menjadi negatif.',
                ]);
            }

            $inventory->forceFill([
                'quantity' => $quantityAfter,
                'last_movement_at' => now(),
            ])->save();

            StockMovement::query()->create([
                'tenant_id' => $inventory->tenant_id,
                'store_id' => $inventory->store_id,
                'product_id' => $inventory->product_id,
                'type' => 'adjustment',
                'quantity' => $data['quantity_change'],
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'notes' => $data['reason'],
                'created_by' => $user->id,
            ]);

            CheckLowStockJob::dispatch(
                (int) $inventory->tenant_id,
                (int) $inventory->store_id,
                (int) $inventory->product_id,
            )->onQueue('notifications')->afterCommit();

            return $inventory->load('product');
        });
    }
}
