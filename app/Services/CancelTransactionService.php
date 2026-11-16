<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CancelTransactionService
{
    public function cancel(Transaction $transaction, User $user, string $reason): Transaction
    {
        return DB::transaction(function () use ($transaction, $user, $reason): Transaction {
            $lockedTransaction = Transaction::query()
                ->with('items')
                ->lockForUpdate()
                ->findOrFail($transaction->id);

            if ($lockedTransaction->status !== 'completed') {
                throw ValidationException::withMessages([
                    'transaction' => 'Hanya transaksi selesai yang dapat dibatalkan.',
                ]);
            }

            foreach ($lockedTransaction->items as $item) {
                if ($item->product_id === null) {
                    continue;
                }

                $inventory = Inventory::query()
                    ->where('store_id', $lockedTransaction->store_id)
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
                    'tenant_id' => $lockedTransaction->tenant_id,
                    'store_id' => $lockedTransaction->store_id,
                    'product_id' => $item->product_id,
                    'type' => 'return',
                    'quantity' => $item->quantity,
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $quantityAfter,
                    'reference_type' => Transaction::class,
                    'reference_id' => $lockedTransaction->id,
                    'notes' => $reason,
                    'created_by' => $user->id,
                ]);
            }

            $lockedTransaction->forceFill([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancelled_by' => $user->id,
                'cancel_reason' => $reason,
            ])->save();

            return $lockedTransaction;
        });
    }
}
