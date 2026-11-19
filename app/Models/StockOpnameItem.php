<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $stock_opname_id
 * @property int $product_id
 * @property string $system_quantity
 * @property string $physical_quantity
 * @property string $difference
 */
class StockOpnameItem extends Model
{
    protected $fillable = [
        'stock_opname_id', 'product_id', 'system_quantity', 'physical_quantity', 'difference', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'system_quantity' => 'decimal:3',
            'physical_quantity' => 'decimal:3',
            'difference' => 'decimal:3',
        ];
    }

    /** @return BelongsTo<StockOpname, $this> */
    public function stockOpname(): BelongsTo
    {
        return $this->belongsTo(StockOpname::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
