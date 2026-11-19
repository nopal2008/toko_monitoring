<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\StockOpnameItem;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockOpnameService
{
    /**
     * @param  array{
     *     warehouse_id: int,
     *     notes?: string|null,
     *     items: array<int, array{product_id: int, physical_quantity: int, notes?: string|null}>
     * }  $data
     */
    public function create(User $user, array $data): StockOpname
    {
        return DB::transaction(function () use ($user, $data): StockOpname {
            $warehouse = Warehouse::query()->findOrFail($data['warehouse_id']);

            if ($warehouse->store_id === null) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'Stock opname membutuhkan gudang yang terhubung ke cabang.',
                ]);
            }

            abort_unless($user->canAccessStore((int) $warehouse->store_id), 403);

            $productIds = collect($data['items'])->pluck('product_id');
            $inventories = Inventory::query()
                ->where('store_id', $warehouse->store_id)
                ->whereIn('product_id', $productIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('product_id');

            if ($inventories->count() !== $productIds->unique()->count()) {
                throw ValidationException::withMessages([
                    'items' => 'Sebagian produk tidak memiliki catatan stok pada cabang gudang ini.',
                ]);
            }

            $opname = StockOpname::query()->create([
                'tenant_id' => $user->tenant_id,
                'warehouse_id' => $warehouse->id,
                'reference' => $this->nextReference(),
                'status' => 'counting',
                'counted_by' => $user->id,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $systemQuantity = (int) $inventories->get($item['product_id'])->quantity;
                $physicalQuantity = (int) $item['physical_quantity'];

                StockOpnameItem::query()->create([
                    'stock_opname_id' => $opname->id,
                    'product_id' => $item['product_id'],
                    'system_quantity' => $systemQuantity,
                    'physical_quantity' => $physicalQuantity,
                    'difference' => $physicalQuantity - $systemQuantity,
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            return $opname->load(['items.product:id,name,sku', 'warehouse:id,name,store_id']);
        });
    }

    public function post(StockOpname $opname, User $user): StockOpname
    {
        return DB::transaction(function () use ($opname, $user): StockOpname {
            $locked = StockOpname::query()
                ->with(['items', 'warehouse'])
                ->lockForUpdate()
                ->findOrFail($opname->id);

            if (! in_array($locked->status, ['draft', 'counting', 'submitted'], true)) {
                throw ValidationException::withMessages([
                    'opname' => 'Stock opname ini sudah diposting atau tidak dapat diproses.',
                ]);
            }

            $warehouse = $locked->warehouse;

            if ($warehouse === null || $warehouse->store_id === null) {
                throw ValidationException::withMessages([
                    'opname' => 'Gudang stock opname tidak terhubung ke cabang.',
                ]);
            }

            abort_unless($user->canAccessStore((int) $warehouse->store_id), 403);

            foreach ($locked->items as $item) {
                $inventory = Inventory::query()
                    ->where('store_id', $warehouse->store_id)
                    ->where('product_id', $item->product_id)
                    ->lockForUpdate()
                    ->firstOrFail();
                $quantityBefore = (int) $inventory->quantity;
                $quantityAfter = (int) $item->physical_quantity;
                $difference = $quantityAfter - $quantityBefore;

                $inventory->forceFill([
                    'quantity' => $quantityAfter,
                    'last_movement_at' => now(),
                ])->save();

                if ($difference !== 0) {
                    StockMovement::query()->create([
                        'tenant_id' => $locked->tenant_id,
                        'store_id' => $warehouse->store_id,
                        'product_id' => $item->product_id,
                        'type' => 'opname',
                        'quantity' => $difference,
                        'quantity_before' => $quantityBefore,
                        'quantity_after' => $quantityAfter,
                        'reference_type' => StockOpname::class,
                        'reference_id' => $locked->id,
                        'notes' => $locked->reference,
                        'created_by' => $user->id,
                    ]);
                }
            }

            $locked->forceFill([
                'status' => 'completed',
                'approved_by' => $user->id,
            ])->save();

            return $locked->load(['items.product:id,name,sku', 'warehouse:id,name,store_id']);
        });
    }

    private function nextReference(): string
    {
        $prefix = 'OPN-'.now()->format('Ymd').'-';
        $sequence = 1;

        while (StockOpname::query()->where('reference', $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT))->exists()) {
            $sequence++;
        }

        return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
