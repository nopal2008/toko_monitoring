<?php

use App\Models\Product;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    $this->withoutVite();
});

/**
 * @param  array<int, string>  $permissions
 * @return array{tenant: Tenant, user: User}
 */
function createProductTestUser(string $roleName, array $permissions): array
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $tenant = Tenant::query()->create([
        'name' => 'Product Test Tenant',
        'code' => Str::uuid()->toString(),
    ]);

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'is_active' => true,
    ]);

    $role = Role::query()->create([
        'name' => $roleName.'-'.Str::uuid()->toString(),
        'guard_name' => 'web',
        'tenant_id' => null,
    ]);

    $role->syncPermissions(collect($permissions)
        ->map(fn (string $permission): Permission => Permission::findOrCreate($permission, 'web'))
        ->all());
    $user->assignRole($role);

    return ['tenant' => $tenant, 'user' => $user];
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validProductPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Arabica Coffee',
        'sku' => Str::uuid()->toString(),
        'unit' => 'pack',
        'base_price' => '45000.00',
        'cost_price' => '30000.00',
    ], $overrides);
}

it('redirects unauthenticated visitors from the product list to login', function () {
    $this->get(route('products.index'))
        ->assertRedirect(route('login'));
});

it('allows a role with product.view to list products', function () {
    ['user' => $user] = createProductTestUser('store_manager', ['product.view']);

    $this->actingAs($user)
        ->get(route('products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('Products/Index', false));
});

it('forbids a role without product.view from listing products', function () {
    ['user' => $user] = createProductTestUser('cashier', []);

    $this->actingAs($user)
        ->get(route('products.index'))
        ->assertForbidden();
});

it('allows a role with product.view to view a product in its tenant', function () {
    ['tenant' => $tenant, 'user' => $user] = createProductTestUser('store_manager', ['product.view']);
    $product = Product::query()->create(validProductPayload([
        'tenant_id' => $tenant->id,
    ]));

    $this->actingAs($user)
        ->get(route('products.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Products/Show', false)
            ->where('product.id', $product->id));
});

it('forbids a role without product.manage from creating products', function () {
    ['user' => $user] = createProductTestUser('cashier', ['product.view']);

    $this->actingAs($user)
        ->post(route('products.store'), validProductPayload())
        ->assertForbidden();

    $this->assertDatabaseMissing('products', ['name' => 'Arabica Coffee']);
});

it('creates products in the authenticated tenant and ignores a submitted tenant id', function () {
    ['tenant' => $tenant, 'user' => $user] = createProductTestUser('owner', ['product.manage']);
    $otherTenant = Tenant::query()->create([
        'name' => 'Other Tenant',
        'code' => Str::uuid()->toString(),
    ]);
    $payload = validProductPayload(['tenant_id' => $otherTenant->id]);

    $response = $this->actingAs($user)->post(route('products.store'), $payload);
    $product = Product::query()->where('sku', $payload['sku'])->firstOrFail();

    $response->assertRedirectToRoute('products.show', $product);
    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'tenant_id' => $tenant->id,
        'name' => $payload['name'],
    ]);
});

it('returns validation errors when required product fields are missing', function () {
    ['user' => $user] = createProductTestUser('owner', ['product.manage']);

    $this->actingAs($user)
        ->from(route('products.create'))
        ->post(route('products.store'), [])
        ->assertRedirect(route('products.create'))
        ->assertSessionHasErrors(['name', 'sku', 'unit', 'base_price', 'cost_price']);

    $this->assertDatabaseCount('products', 0);
});

it('updates a product for an authorized role', function () {
    ['tenant' => $tenant, 'user' => $user] = createProductTestUser('owner', ['product.manage']);
    $otherTenant = Tenant::query()->create([
        'name' => 'Other Tenant',
        'code' => Str::uuid()->toString(),
    ]);
    $product = Product::query()->create(validProductPayload([
        'tenant_id' => $tenant->id,
    ]));
    $payload = validProductPayload([
        'name' => 'Updated Coffee',
        'sku' => $product->sku,
        'tenant_id' => $otherTenant->id,
    ]);

    $this->actingAs($user)
        ->patch(route('products.update', $product), $payload)
        ->assertRedirectToRoute('products.show', $product);

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'name' => 'Updated Coffee',
        'tenant_id' => $tenant->id,
    ]);
});

it('soft deletes a product for an authorized role', function () {
    ['tenant' => $tenant, 'user' => $user] = createProductTestUser('owner', ['product.manage']);
    $product = Product::query()->create(validProductPayload([
        'tenant_id' => $tenant->id,
    ]));

    $this->actingAs($user)
        ->delete(route('products.destroy', $product))
        ->assertRedirectToRoute('products.index');

    $this->assertSoftDeleted($product);
});

it('returns not found when a user requests another tenant product', function () {
    ['user' => $user] = createProductTestUser('store_manager', ['product.view']);
    $otherTenant = Tenant::query()->create([
        'name' => 'Other Tenant',
        'code' => Str::uuid()->toString(),
    ]);
    Auth::logout();
    $product = Product::withoutGlobalScopes()->create(validProductPayload([
        'tenant_id' => $otherTenant->id,
    ]));

    $this->actingAs($user)
        ->get(route('products.show', $product))
        ->assertNotFound();
});
