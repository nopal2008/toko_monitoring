<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $store_id
 * @property int $user_id
 * @property string $status
 * @property string $opening_cash
 * @property string|null $notes
 */
class CashierShift extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'store_id', 'user_id', 'opened_at', 'closed_at', 'opening_cash',
        'closing_cash', 'expected_cash', 'cash_difference', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime', 'closed_at' => 'datetime', 'opening_cash' => 'decimal:2',
            'closing_cash' => 'decimal:2', 'expected_cash' => 'decimal:2', 'cash_difference' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Store, $this> */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /** @return BelongsTo<User, $this> */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return HasMany<Transaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
