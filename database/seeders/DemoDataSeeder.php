<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Brand;
use App\Models\Store;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first tenant and user
        $tenant = Tenant::first();
        $user = User::first();

        if (! $tenant || ! $user) {
            $this->command->warn('Please run the RolePermissionSeeder first!');

            return;
        }

        $this->command->info('Creating demo data for Areas, Warehouses, Brands, and Units...');

        // Create Areas
        $areas = [
            ['name' => 'Jakarta Pusat', 'code' => 'JKT', 'description' => 'Wilayah Jakarta Pusat dan sekitarnya'],
            ['name' => 'Jakarta Barat', 'code' => 'JKT-BRT', 'description' => 'Wilayah Jakarta Barat'],
            ['name' => 'Bogor', 'code' => 'BGR', 'description' => 'Wilayah Bogor dan Depok'],
            ['name' => 'Tangerang', 'code' => 'TNG', 'description' => 'Wilayah Tangerang dan BSD'],
            ['name' => 'Bekasi', 'code' => 'BKS', 'description' => 'Wilayah Bekasi dan Cikarang'],
        ];

        foreach ($areas as $areaData) {
            Area::create([
                ...$areaData,
                'tenant_id' => $tenant->id,
                'is_active' => true,
            ]);
        }

        $this->command->info('Created 5 demo areas.');

        // Get stores for warehouse association
        $stores = Store::where('tenant_id', $tenant->id)->take(3)->get();

        // Create Warehouses
        $warehouses = [
            [
                'name' => 'Gudang Pusat Jakarta',
                'code' => 'WH-CEN-01',
                'type' => 'central',
                'address' => 'Jl. Sudirman No. 123, Jakarta Pusat',
                'is_active' => true,
            ],
            [
                'name' => 'Gudang Cabang Tanah Abang',
                'code' => 'WH-TAB-01',
                'type' => 'branch',
                'store_id' => $stores[0]->id ?? null,
                'address' => 'Jl. Tanah Abang No. 45, Jakarta Pusat',
                'is_active' => true,
            ],
            [
                'name' => 'Gudang Cabang Senayan',
                'code' => 'WH-SNY-01',
                'type' => 'branch',
                'store_id' => $stores[1]->id ?? null,
                'address' => 'Jl. Senayan No. 78, Jakarta Selatan',
                'is_active' => true,
            ],
            [
                'name' => 'Gudang Cabang BSD',
                'code' => 'WH-BSD-01',
                'type' => 'branch',
                'store_id' => $stores[2]->id ?? null,
                'address' => 'Jl. BSD Boulevard No. 99, Tangerang',
                'is_active' => true,
            ],
        ];

        foreach ($warehouses as $warehouseData) {
            Warehouse::create([
                ...$warehouseData,
                'tenant_id' => $tenant->id,
            ]);
        }

        $this->command->info('Created 4 demo warehouses.');

        // Create Brands
        $brands = [
            ['name' => 'Indomie', 'slug' => 'indomie', 'is_active' => true],
            ['name' => 'Aqua', 'slug' => 'aqua', 'is_active' => true],
            ['name' => 'Roma', 'slug' => 'roma', 'is_active' => true],
            ['name' => 'Coca-Cola', 'slug' => 'coca-cola', 'is_active' => true],
            ['name' => 'Unilever', 'slug' => 'unilever', 'is_active' => true],
            ['name' => 'P&G', 'slug' => 'p-g', 'is_active' => true],
            ['name' => 'Wings', 'slug' => 'wings', 'is_active' => true],
            ['name' => 'Mayora', 'slug' => 'mayora', 'is_active' => true],
            ['name' => 'Nestle', 'slug' => 'nestle', 'is_active' => true],
            ['name' => 'Ultrajaya', 'slug' => 'ultrajaya', 'is_active' => true],
        ];

        foreach ($brands as $brandData) {
            Brand::create([
                ...$brandData,
                'tenant_id' => $tenant->id,
            ]);
        }

        $this->command->info('Created 10 demo brands.');

        // Create Units
        $units = [
            ['name' => 'Pieces', 'symbol' => 'pcs', 'is_active' => true],
            ['name' => 'Kilogram', 'symbol' => 'kg', 'is_active' => true],
            ['name' => 'Gram', 'symbol' => 'g', 'is_active' => true],
            ['name' => 'Liter', 'symbol' => 'L', 'is_active' => true],
            ['name' => 'Milliliter', 'symbol' => 'mL', 'is_active' => true],
            ['name' => 'Dus', 'symbol' => 'dus', 'is_active' => true],
            ['name' => 'Pack', 'symbol' => 'pack', 'is_active' => true],
            ['name' => 'Box', 'symbol' => 'box', 'is_active' => true],
            ['name' => 'Botol', 'symbol' => 'botol', 'is_active' => true],
            ['name' => 'Kaleng', 'symbol' => 'kaleng', 'is_active' => true],
        ];

        foreach ($units as $unitData) {
            Unit::create([
                ...$unitData,
                'tenant_id' => $tenant->id,
            ]);
        }

        $this->command->info('Created 10 demo units.');

        $this->command->info('Demo data successfully created!');
    }
}
