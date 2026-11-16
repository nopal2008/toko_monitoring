<?php

namespace App\Policies;

use App\Models\StockTransfer;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class TenantResourcePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->tenant_id !== null;
    }

    public function view(User $user, Model $model): bool
    {
        return $this->canAccessRecord($user, $model);
    }

    public function create(User $user): bool
    {
        return $user->tenant_id !== null && $user->is_active;
    }

    public function update(User $user, Model $model): bool
    {
        return $this->canAccessRecord($user, $model);
    }

    public function delete(User $user, Model $model): bool
    {
        return $this->canAccessRecord($user, $model);
    }

    private function canAccessRecord(User $user, Model $model): bool
    {
        if ($user->tenant_id === null || (int) $model->getAttribute('tenant_id') !== (int) $user->tenant_id) {
            return false;
        }

        if ($model instanceof StockTransfer) {
            return $user->canAccessStore($model->from_store_id)
                && $user->canAccessStore($model->to_store_id);
        }

        $storeId = $model->getAttribute('store_id');

        return $storeId === null || $user->canAccessStore((int) $storeId);
    }
}
