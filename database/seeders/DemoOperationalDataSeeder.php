<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Attendance;
use App\Models\Brand;
use App\Models\Category;
use App\Models\DailyStoreSummary;
use App\Models\Employee;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Store;
use App\Models\Tenant;
use App\Models\Transaction;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;

class DemoOperationalDataSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            throw new \RuntimeException('Demo operational data may only be seeded outside production.');
        }

        $tenant = Tenant::query()->where('code', 'demo-toko')->firstOrFail();
        $stores = Store::query()->where('tenant_id', $tenant->id)->whereIn('code', ['DEMO-PUSAT', 'DEMO-SELATAN'])->get()->keyBy('code');
        $cashier = User::query()->where('tenant_id', $tenant->id)->where('email', 'cashier@demo.test')->firstOrFail();

        $area = Area::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'code' => 'JAWA-TIMUR'],
            [
                'name' => 'Jawa Timur',
                'description' => 'Area operasional Jawa Timur.',
                'is_active' => true,
            ],
        );

        $centralWarehouse = Warehouse::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'code' => 'DEMO-WH-PUSAT'],
            [
                'name' => 'Demo Gudang Pusat',
                'type' => 'central',
                'address' => 'Jl. Demo No. 1, Jakarta',
                'is_active' => true,
            ],
        );

        $branchWarehouse = Warehouse::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'code' => 'DEMO-WH-SELATAN'],
            [
                'name' => 'Demo Gudang Selatan',
                'type' => 'branch',
                'store_id' => $stores['DEMO-SELATAN']->id,
                'address' => 'Jl. Demo No. 2, Jakarta',
                'is_active' => true,
            ],
        );

        $brand = Brand::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'slug' => 'demo-brand'],
            [
                'name' => 'Merek Demo',
                'is_active' => true,
            ],
        );

        foreach ([['name' => 'Pcs', 'symbol' => 'pcs'], ['name' => 'Box', 'symbol' => 'box'], ['name' => 'Kg', 'symbol' => 'kg'], ['name' => 'Liter', 'symbol' => 'L']] as $unitData) {
            Unit::query()->firstOrCreate(
                ['tenant_id' => $tenant->id, 'name' => $unitData['name']],
                ['symbol' => $unitData['symbol'], 'is_active' => true],
            );
        }

        $unit = Unit::query()->firstOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Pcs'],
            ['symbol' => 'pcs', 'is_active' => true],
        );

        $category = Category::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'name' => 'Demo Produk'],
            ['is_active' => true],
        );

        $products = collect([
            ['sku' => 'DEMO-001', 'name' => 'Kopi Arabika 200g', 'price' => 68000, 'cost' => 45000],
            ['sku' => 'DEMO-002', 'name' => 'Teh Melati 50 sachet', 'price' => 32000, 'cost' => 21000],
            ['sku' => 'DEMO-003', 'name' => 'Gula Aren 500g', 'price' => 28000, 'cost' => 18000],
        ])->mapWithKeys(function (array $attributes) use ($category, $tenant, $stores, $brand, $unit): array {
            $product = Product::query()->updateOrCreate(
                ['tenant_id' => $tenant->id, 'sku' => $attributes['sku']],
                [
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'unit_id' => $unit->id,
                    'name' => $attributes['name'],
                    'unit' => $unit->symbol,
                    'description' => 'Data produk contoh untuk dashboard demo.',
                    'base_price' => $attributes['price'],
                    'cost_price' => $attributes['cost'],
                    'is_active' => true,
                ],
            );

            $product->stores()->syncWithoutDetaching($stores->mapWithKeys(
                fn (Store $store): array => [$store->id => [
                    'tenant_id' => $tenant->id,
                    'price' => $attributes['price'],
                    'min_stock' => 10,
                    'is_available' => true,
                ]],
            )->all());

            foreach ($stores as $store) {
                Inventory::query()->updateOrCreate(
                    ['store_id' => $store->id, 'product_id' => $product->id],
                    [
                        'tenant_id' => $tenant->id,
                        'quantity' => 15 + $product->id,
                        'reserved_quantity' => 0,
                        'min_stock' => $product->sku === 'DEMO-003' ? 30 : 10,
                        'last_movement_at' => now(),
                    ],
                );
            }

            return [$attributes['sku'] => $product];
        });

        foreach (range(29, 0) as $daysAgo) {
            $date = now()->subDays($daysAgo);

            foreach ($stores as $store) {
                $dailySales = 420000 + (($daysAgo + $store->id) % 8) * 37500;
                $invoiceNumber = 'DEMO-'.$date->format('Ymd').'-'.$store->code;
                $transactionTime = $date->copy()->setTime(10 + ($daysAgo % 8), 15);

                Transaction::query()->updateOrCreate(
                    ['invoice_number' => $invoiceNumber],
                    [
                        'tenant_id' => $tenant->id,
                        'store_id' => $store->id,
                        'cashier_shift_id' => null,
                        'user_id' => $cashier->id,
                        'subtotal_amount' => $dailySales,
                        'discount_amount' => 0,
                        'tax_amount' => 0,
                        'total_amount' => $dailySales,
                        'paid_amount' => $dailySales,
                        'change_amount' => 0,
                        'payment_method' => $daysAgo % 2 === 0 ? 'cash' : 'qris',
                        'status' => 'completed',
                        'completed_at' => $transactionTime,
                        'created_at' => $transactionTime,
                        'updated_at' => $transactionTime,
                    ],
                );

                DailyStoreSummary::query()->updateOrCreate(
                    ['store_id' => $store->id, 'summary_date' => $date->toDateString()],
                    [
                        'tenant_id' => $tenant->id,
                        'total_sales' => $dailySales,
                        'total_transactions' => 1,
                        'total_items_sold' => 3,
                        'total_discount' => 0,
                        'total_expenses' => 0,
                        'gross_profit' => $dailySales * 0.3,
                        'low_stock_count' => 1,
                        'attendance_present_count' => 1,
                        'attendance_late_count' => $daysAgo % 5 === 0 ? 1 : 0,
                    ],
                );
            }
        }

        $employee = Employee::query()
            ->where('tenant_id', $tenant->id)
            ->where('user_id', User::query()->where('email', 'staff@demo.test')->value('id'))
            ->first();

        if ($employee !== null) {
            foreach (range(13, 0) as $daysAgo) {
                $date = now()->subDays($daysAgo)->startOfDay();
                $isLate = $daysAgo % 5 === 0;

                Attendance::query()->updateOrCreate(
                    ['employee_id' => $employee->id, 'date' => $date->toDateString()],
                    [
                        'tenant_id' => $tenant->id,
                        'store_id' => $employee->store_id,
                        'scheduled_start' => '08:00:00',
                        'check_in_at' => $date->copy()->setTime($isLate ? 8 : 7, $isLate ? 18 : 55),
                        'check_out_at' => $date->copy()->setTime(17, 0),
                        'late_minutes' => $isLate ? 18 : 0,
                        'work_minutes' => 480,
                        'status' => $isLate ? 'late' : 'present',
                        'notes' => 'Data contoh untuk akun staff demo.',
                    ],
                );
            }
        }
    }
}
