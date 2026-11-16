<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $check_in_at
 * @property Carbon|null $check_out_at
 * @property string|null $photo_path
 */
class Attendance extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'employee_id', 'store_id', 'date', 'scheduled_start', 'check_in_at', 'check_out_at',
        'late_minutes', 'work_minutes', 'status', 'check_in_latitude', 'check_in_longitude',
        'check_out_latitude', 'check_out_longitude', 'photo_path', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date', 'check_in_at' => 'datetime', 'check_out_at' => 'datetime',
            'check_in_latitude' => 'decimal:7', 'check_in_longitude' => 'decimal:7',
            'check_out_latitude' => 'decimal:7', 'check_out_longitude' => 'decimal:7',
        ];
    }

    /** @return BelongsTo<Employee, $this> */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /** @return BelongsTo<Store, $this> */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
