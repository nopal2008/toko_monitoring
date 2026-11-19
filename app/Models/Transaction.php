<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $tenant_id
 * @property int $store_id
 * @property string $status
 * @property Carbon|string $summary_date
 * @property string $total_sales
 * @property int $total_transactions
 */
class Transaction extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'store_id', 'cashier_shift_id', 'invoice_number', 'user_id', 'subtotal_amount',
        'discount_amount', 'tax_amount', 'total_amount', 'paid_amount', 'change_amount',
        'payment_method', 'status', 'notes', 'completed_at', 'cancelled_at', 'cancelled_by', 'cancel_reason',
    ];

    protected function casts(): array
    {
        return [
            'subtotal_amount' => 'decimal:2', 'discount_amount' => 'decimal:2', 'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2', 'paid_amount' => 'decimal:2', 'change_amount' => 'decimal:2',
            'completed_at' => 'datetime', 'cancelled_at' => 'datetime',
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

    /** @return BelongsTo<CashierShift, $this> */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(CashierShift::class, 'cashier_shift_id');
    }

    /** @return HasMany<TransactionItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(TransactionItem::class);
    }

    /** @return HasMany<TransactionPayment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(TransactionPayment::class);
    }
}
