<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int|null $product_id
 * @property int $quantity
 */
class TransactionItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'transaction_id', 'product_id', 'product_name', 'product_sku', 'quantity', 'price',
        'cost_price', 'discount_amount', 'subtotal',
    ];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'cost_price' => 'decimal:2', 'discount_amount' => 'decimal:2', 'subtotal' => 'decimal:2'];
    }

    /** @return BelongsTo<Transaction, $this> */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /** @return BelongsTo<Product, $this> */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
