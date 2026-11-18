<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Store;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleLoginSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new \RuntimeException('Demo accounts may only be seeded outside production.');
        }

        $tenant = Tenant::query()->firstOrCreate(
            ['code' => 'demo-toko'],
            [
                'name' => 'Demo Toko',
                'timezone' => 'Asia/Jakarta',
                'currency' => 'IDR',
                'is_active' => true,
            ],
        );

        $stores = collect([
            ['code' => 'DEMO-PUSAT', 'name' => 'Demo Toko Pusat', 'city' => 'Jakarta'],
            ['code' => 'DEMO-SELATAN', 'name' => 'Demo Toko Selatan', 'city' => 'Jakarta'],
        ])->mapWithKeys(function (array $attributes) use ($tenant): array {
            $store = Store::query()->updateOrCreate(
                ['tenant_id' => $tenant->id, 'code' => $attributes['code']],
                [
                    'name' => $attributes['name'],
                    'city' => $attributes['city'],
                    'address' => 'Alamat contoh '.$attributes['name'],
                    'phone' => '0215550100',
                    'radius_meter' => 100,
                    'is_active' => true,
                ],
            );

            return [$attributes['code'] => $store];
        });

        $accounts = [
            ['name' => 'Demo Owner', 'email' => 'owner@demo.test', 'role' => 'owner', 'stores' => ['DEMO-PUSAT', 'DEMO-SELATAN']],
            ['name' => 'Demo Area Manager', 'email' => 'area.manager@demo.test', 'role' => 'area_manager', 'stores' => ['DEMO-PUSAT', 'DEMO-SELATAN']],
            ['name' => 'Demo Store Manager', 'email' => 'store.manager@demo.test', 'role' => 'store_manager', 'stores' => ['DEMO-PUSAT']],
            ['name' => 'Demo Cashier', 'email' => 'cashier@demo.test', 'role' => 'cashier', 'stores' => ['DEMO-PUSAT']],
            ['name' => 'Demo Staff', 'email' => 'staff@demo.test', 'role' => 'staff', 'stores' => ['DEMO-PUSAT']],
        ];

        foreach ($accounts as $account) {
            $user = User::withTrashed()->firstOrNew(
                ['email' => $account['email']],
            );
            $user->fill([
                'tenant_id' => $tenant->id,
                'name' => $account['name'],
                'password' => 'password',
                'is_active' => true,
            ]);
            $user->deleted_at = null;
            $user->save();

            $user->syncRoles($account['role']);
            $user->stores()->sync(collect($account['stores'])->mapWithKeys(
                fn (string $code): array => [$stores[$code]->id => [
                    'is_manager' => in_array($account['role'], ['owner', 'area_manager', 'store_manager'], true),
                    'assigned_at' => now(),
                ]],
            )->all());

            if ($account['role'] !== 'owner') {
                Employee::query()->updateOrCreate(
                    ['tenant_id' => $tenant->id, 'employee_code' => 'DEMO-'.strtoupper(str_replace('.', '-', explode('@', $account['email'])[0]))],
                    [
                        'user_id' => $user->id,
                        'store_id' => $stores[$account['stores'][0]]->id,
                        'name' => $account['name'],
                        'email' => $account['email'],
                        'position' => str_replace('_', ' ', $account['role']),
                        'join_date' => now()->subMonths(6)->toDateString(),
                        'is_active' => true,
                    ],
                );
            }
        }

        $owner = User::query()->where('email', 'owner@demo.test')->firstOrFail();
        $tenant->update(['owner_id' => $owner->id]);
    }
}
