<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $transaction_id
 * @property string $method
 * @property string $amount
 * @property string|null $reference_number
 */
class TransactionPayment extends Model
{
    public $timestamps = false;

    protected $fillable = ['transaction_id', 'method', 'amount', 'reference_number', 'paid_at'];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'paid_at' => 'datetime'];
    }

    /** @return BelongsTo<Transaction, $this> */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
