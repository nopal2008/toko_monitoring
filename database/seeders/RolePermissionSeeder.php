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
            'purchase.view', 'purchase.manage',
            'expense.create', 'expense.approve', 'attendance.view', 'attendance.manage',
            'report.view', 'report.export', 'setting.manage', 'user.manage',
            'area.view', 'area.manage', 'warehouse.view', 'warehouse.manage', 'brand.view', 'brand.manage', 'unit.view', 'unit.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $roles = [
            'owner' => $permissions,
            'area_manager' => [
                'store.view', 'product.view', 'product.manage', 'inventory.view', 'inventory.transfer',
                'transaction.view', 'transaction.cancel', 'expense.create', 'expense.approve',
                'attendance.view', 'attendance.manage', 'report.view', 'report.export',
                'area.view', 'area.manage', 'warehouse.view', 'warehouse.manage', 'brand.view', 'brand.manage', 'unit.view', 'unit.manage',
            ],
            'store_manager' => [
                'store.view', 'product.view', 'inventory.view', 'inventory.adjust', 'inventory.transfer',
                'transaction.view', 'transaction.create', 'transaction.cancel', 'purchase.view', 'purchase.manage',
                'expense.create', 'attendance.view',
                'report.view', 'warehouse.view', 'warehouse.manage', 'brand.view', 'brand.manage', 'unit.view', 'unit.manage',
            ],
            'cashier' => ['transaction.view', 'transaction.create'],
            'staff' => [
                'product.view',
                'inventory.view',
                'transaction.view',
                'attendance.view',
            ],
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
