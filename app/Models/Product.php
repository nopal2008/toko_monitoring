<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $name
 * @property string $sku
 * @property string $base_price
 * @property string $cost_price
 */
class Product extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'category_id', 'name', 'sku', 'barcode', 'unit', 'description',
        'base_price', 'cost_price', 'is_active',
    ];

    protected function casts(): array
    {
        return ['base_price' => 'decimal:2', 'cost_price' => 'decimal:2', 'is_active' => 'boolean'];
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsToMany<Store, $this, Pivot, 'pivot'> */
    public function stores(): BelongsToMany
    {
        return $this->belongsToMany(Store::class, 'product_store')
            ->withPivot(['tenant_id', 'price', 'min_stock', 'is_available'])
            ->withTimestamps();
    }

    /** @return HasMany<Inventory, $this> */
    public function inventories(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }
}
