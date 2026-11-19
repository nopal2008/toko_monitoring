<?php

use App\Jobs\CheckLowStockJob;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\StockOpname;
use App\Models\Store;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\CreateTransactionService;
use App\Services\StockOpnameService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * @return array{tenant: Tenant, store: Store, product: Product, user: User, inventory: Inventory}
 */
function createPosFixture(int $quantity = 10): array
{
    $tenant = Tenant::query()->create([
        'name' => 'POS Test Tenant',
        'code' => Str::uuid()->toString(),
    ]);

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'is_active' => true,
    ]);

    test()->actingAs($user);

    $store = Store::query()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Toko Utama',
        'code' => 'TK-'.Str::upper(Str::random(4)),
    ]);

    $store->users()->attach($user->id, ['is_manager' => true, 'assigned_at' => now()]);

    $product = Product::query()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Kopi Arabica',
        'sku' => Str::upper(Str::random(8)),
        'unit' => 'pcs',
        'base_price' => '10000.00',
        'cost_price' => '6000.00',
    ]);

    DB::table('product_store')->insert([
        'tenant_id' => $tenant->id,
        'product_id' => $product->id,
        'store_id' => $store->id,
        'price' => '10000.00',
        'wholesale_price' => '9000.00',
        'wholesale_min_qty' => 5,
        'min_stock' => 2,
        'is_available' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $inventory = Inventory::query()->create([
        'tenant_id' => $tenant->id,
        'store_id' => $store->id,
        'product_id' => $product->id,
        'quantity' => $quantity,
        'reserved_quantity' => 0,
        'min_stock' => 2,
    ]);

    Setting::query()->create([
        'tenant_id' => $tenant->id,
        'setting_group' => 'receipt',
        'setting_key' => 'tax_percentage',
        'value' => ['value' => '10'],
    ]);

    return compact('tenant', 'store', 'product', 'user', 'inventory');
}

it('applies wholesale pricing, product promotion, tax, and split payments', function () {
    Queue::fake();

    ['tenant' => $tenant, 'store' => $store, 'product' => $product, 'user' => $user, 'inventory' => $inventory] = createPosFixture();

    Promotion::query()->create([
        'tenant_id' => $tenant->id,
        'store_id' => $store->id,
        'product_id' => $product->id,
        'name' => 'Diskon Kopi 10%',
        'type' => Promotion::TYPE_PERCENT,
        'value' => '10',
        'min_purchase' => '0',
        'is_active' => true,
    ]);

    $transaction = app(CreateTransactionService::class)->create($user, [
        'store_id' => $store->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 5],
        ],
        'payments' => [
            ['method' => 'cash', 'amount' => '30000.00'],
            ['method' => 'qris', 'amount' => '20000.00', 'reference_number' => 'QR-1'],
        ],
    ]);

    expect($transaction->payment_method)->toBe('split')
        ->and($transaction->subtotal_amount)->toBe('45000.00')
        ->and($transaction->discount_amount)->toBe('4500.00')
        ->and($transaction->tax_amount)->toBe('4050.00')
        ->and($transaction->total_amount)->toBe('44550.00')
        ->and($transaction->paid_amount)->toBe('50000.00')
        ->and($transaction->change_amount)->toBe('5450.00')
        ->and($transaction->payments)->toHaveCount(2)
        ->and($transaction->items->first()->price)->toBe('9000.00')
        ->and($transaction->items->first()->discount_amount)->toBe('4500.00');

    expect($inventory->refresh()->quantity)->toBe(5);
    expect(StockMovement::query()->where('type', 'sale')->value('quantity'))->toBe(-5);
    Queue::assertPushed(CheckLowStockJob::class);
});

it('rejects checkout when payment is below the computed total', function () {
    Queue::fake();

    ['store' => $store, 'product' => $product, 'user' => $user, 'inventory' => $inventory] = createPosFixture();

    expect(fn () => app(CreateTransactionService::class)->create($user, [
        'store_id' => $store->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
        'payments' => [
            ['method' => 'cash', 'amount' => '10000.00'],
        ],
    ]))->toThrow(ValidationException::class);

    expect($inventory->refresh()->quantity)->toBe(10);
    expect(DB::table('transactions')->count())->toBe(0);
});

it('creates and posts a stock opname that reconciles inventory differences', function () {
    ['tenant' => $tenant, 'store' => $store, 'product' => $product, 'user' => $user, 'inventory' => $inventory] = createPosFixture();

    $warehouse = Warehouse::query()->create([
        'tenant_id' => $tenant->id,
        'store_id' => $store->id,
        'name' => 'Gudang Toko Utama',
        'code' => 'GD-'.Str::upper(Str::random(4)),
        'type' => 'branch',
    ]);

    $service = app(StockOpnameService::class);

    $opname = $service->create($user, [
        'warehouse_id' => $warehouse->id,
        'notes' => 'Hitung mingguan',
        'items' => [
            ['product_id' => $product->id, 'physical_quantity' => 7],
        ],
    ]);

    expect($opname->status)->toBe('counting')
        ->and($opname->reference)->toStartWith('OPN-')
        ->and($opname->items)->toHaveCount(1)
        ->and((int) $opname->items->first()->system_quantity)->toBe(10)
        ->and((int) $opname->items->first()->difference)->toBe(-3);

    $posted = $service->post($opname, $user);

    expect($posted->status)->toBe('completed')
        ->and($posted->approved_by)->toBe($user->id);
    expect($inventory->refresh()->quantity)->toBe(7);

    $movement = StockMovement::query()->where('type', 'opname')->firstOrFail();

    expect((int) $movement->quantity)->toBe(-3)
        ->and((int) $movement->quantity_before)->toBe(10)
        ->and((int) $movement->quantity_after)->toBe(7)
        ->and($movement->reference_id)->toBe($opname->id);

    expect(StockOpname::query()->count())->toBe(1);
});
