<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/** @property int $store_id */
class Employee extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'tenant_id', 'user_id', 'store_id', 'employee_code', 'name', 'phone', 'email',
        'position', 'join_date', 'resign_date', 'is_active',
    ];

    protected function casts(): array
    {
        return ['join_date' => 'date', 'resign_date' => 'date', 'is_active' => 'boolean'];
    }

    /** @return BelongsTo<Store, $this> */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Attendance, $this> */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /** @return HasMany<WorkSchedule, $this> */
    public function workSchedules(): HasMany
    {
        return $this->hasMany(WorkSchedule::class);
    }
}
