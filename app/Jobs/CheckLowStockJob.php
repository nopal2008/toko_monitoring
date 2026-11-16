<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckLowStockJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public int $tenantId,
        public int $storeId,
        public int $productId,
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        $inventory = DB::table('inventories')
            ->where('tenant_id', $this->tenantId)
            ->where('store_id', $this->storeId)
            ->where('product_id', $this->productId)
            ->first(['quantity', 'min_stock']);

        if ($inventory === null || $inventory->quantity > $inventory->min_stock) {
            return;
        }

        $debounceKey = "low-stock:{$this->tenantId}:{$this->storeId}:{$this->productId}";

        if (! Cache::add($debounceKey, now()->timestamp, 86400)) {
            return;
        }

        $recipients = User::query()
            ->where('tenant_id', $this->tenantId)
            ->where('is_active', true)
            ->where(function ($query): void {
                $query->whereHas('roles', fn ($roles) => $roles->whereIn('name', ['owner', 'area_manager']))
                    ->orWhere(function ($storeManagers): void {
                        $storeManagers->whereHas('roles', fn ($roles) => $roles->where('name', 'store_manager'))
                            ->whereHas('stores', fn ($stores) => $stores->where('stores.id', $this->storeId));
                    });
            })
            ->get(['id']);

        if ($recipients->isEmpty()) {
            return;
        }

        $preferences = DB::table('notification_preferences')
            ->where('tenant_id', $this->tenantId)
            ->whereIn('user_id', $recipients->pluck('id'))
            ->where('event_key', 'low_stock')
            ->where('in_app', false)
            ->pluck('user_id')
            ->all();
        $excludedUsers = array_fill_keys($preferences, true);
        $productName = DB::table('products')
            ->where('tenant_id', $this->tenantId)
            ->where('id', $this->productId)
            ->value('name');
        $storeName = DB::table('stores')
            ->where('tenant_id', $this->tenantId)
            ->where('id', $this->storeId)
            ->value('name');
        $timestamp = now();
        $notifications = [];

        foreach ($recipients as $recipient) {
            if (isset($excludedUsers[$recipient->id])) {
                continue;
            }

            $notifications[] = [
                'id' => (string) Str::uuid(),
                'tenant_id' => $this->tenantId,
                'type' => 'low_stock',
                'notifiable_type' => User::class,
                'notifiable_id' => $recipient->id,
                'data' => json_encode([
                    'type' => 'low_stock',
                    'message' => "{$productName} stok menipis di {$storeName}.",
                    'store_id' => $this->storeId,
                    'product_id' => $this->productId,
                    'quantity' => $inventory->quantity,
                    'min_stock' => $inventory->min_stock,
                ], JSON_THROW_ON_ERROR),
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }

        if ($notifications !== []) {
            DB::table('notifications')->insert($notifications);
        }
    }
}
