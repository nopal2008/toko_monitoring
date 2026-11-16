<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'store.view', 'store.manage', 'product.view', 'product.manage',
            'inventory.view', 'inventory.adjust', 'inventory.transfer',
            'transaction.view', 'transaction.create', 'transaction.cancel',
            'expense.create', 'expense.approve', 'attendance.view', 'attendance.manage',
            'report.view', 'report.export', 'setting.manage', 'user.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $roles = [
            'owner' => $permissions,
            'admin' => $permissions,
            'area_manager' => [
                'store.view', 'product.view', 'inventory.view', 'inventory.transfer',
                'transaction.view', 'transaction.cancel', 'expense.create', 'expense.approve',
                'attendance.view', 'attendance.manage', 'report.view', 'report.export',
            ],
            'store_manager' => [
                'store.view', 'product.view', 'inventory.view', 'inventory.adjust', 'inventory.transfer',
                'transaction.view', 'transaction.create', 'transaction.cancel', 'expense.create',
                'attendance.view', 'attendance.manage', 'report.view',
            ],
            'cashier' => ['transaction.view', 'transaction.create'],
            'staff' => [],
        ];

        foreach ($roles as $name => $rolePermissions) {
            $role = Role::query()->firstOrCreate([
                'tenant_id' => null,
                'name' => $name,
                'guard_name' => 'web',
            ]);
            $role->syncPermissions($rolePermissions);
        }
    }
}
