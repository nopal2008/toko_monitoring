<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $tenant_id
 * @property int $from_store_id
 * @property int $to_store_id
 * @property string $status
 */
class StockTransfer extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'code', 'from_store_id', 'to_store_id', 'status', 'notes', 'requested_by',
        'approved_by', 'approved_at', 'completed_at', 'cancelled_at',
    ];

    protected function casts(): array
    {
        return ['approved_at' => 'datetime', 'completed_at' => 'datetime', 'cancelled_at' => 'datetime'];
    }

    /** @return BelongsTo<Store, $this> */
    public function sourceStore(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'from_store_id');
    }

    /** @return BelongsTo<Store, $this> */
    public function destinationStore(): BelongsTo
    {
        return $this->belongsTo(Store::class, 'to_store_id');
    }

    /** @return HasMany<StockTransferItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(StockTransferItem::class);
    }
}
