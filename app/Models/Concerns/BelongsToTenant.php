<?php

namespace App\Models\Concerns;

use App\Models\Scopes\TenantScope;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model): void {
            $tenantId = Auth::user()?->tenant_id;

            if ($tenantId !== null) {
                $model->tenant_id = $tenantId;
            }
        });
    }
}
