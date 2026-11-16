<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|string $summary_date
 * @property string $total_sales
 * @property int $total_transactions
 */
class DailyStoreSummary extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'store_id', 'summary_date', 'total_sales', 'total_transactions',
        'total_items_sold', 'total_discount', 'total_expenses', 'gross_profit',
        'low_stock_count', 'attendance_present_count', 'attendance_late_count',
    ];

    protected function casts(): array
    {
        return [
            'summary_date' => 'date', 'total_sales' => 'decimal:2', 'total_discount' => 'decimal:2',
            'total_expenses' => 'decimal:2', 'gross_profit' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Store, $this> */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
