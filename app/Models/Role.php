<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Permission\Contracts\Role as RoleContract;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * @property int|null $tenant_id
 */
class Role extends SpatieRole
{
    protected $fillable = ['name', 'guard_name', 'tenant_id'];

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /** @param array<string, mixed> $params */
    protected static function findByParam(array $params = []): ?RoleContract
    {
        $query = static::query();
        $tenantId = auth()->user()?->tenant_id;

        if ($tenantId !== null) {
            $query->where(function ($builder) use ($tenantId): void {
                $builder->whereNull('tenant_id')->orWhere('tenant_id', $tenantId);
            });
        }

        foreach ($params as $key => $value) {
            $query->where($key, $value);
        }

        return $query->first();
    }
}
