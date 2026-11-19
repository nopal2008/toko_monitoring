<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $tenant_id
 * @property int $warehouse_id
 * @property string $reference
 * @property string $status
 * @property int $counted_by
 * @property int|null $approved_by
 */
class StockOpname extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'warehouse_id', 'reference', 'status', 'counted_by', 'approved_by', 'notes',
    ];

    /** @return BelongsTo<Warehouse, $this> */
    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    /** @return BelongsTo<User, $this> */
    public function counter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counted_by');
    }

    /** @return BelongsTo<User, $this> */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** @return HasMany<StockOpnameItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(StockOpnameItem::class);
    }
}
