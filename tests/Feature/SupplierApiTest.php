<?php

use App\Models\Role;
use App\Models\Supplier;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

/**
 * @param  array<int, string>  $permissions
 * @return array{tenant: Tenant, user: User}
 */
function createSupplierApiUser(string $roleName, array $permissions): array
{
    app(PermissionRegistrar::class)->forgetCachedPermissions();

    $tenant = Tenant::query()->create([
        'name' => 'Supplier API Tenant',
        'code' => Str::uuid()->toString(),
    ]);

    $user = User::factory()->create([
        'tenant_id' => $tenant->id,
        'is_active' => true,
    ]);

    $role = Role::query()->create([
        'name' => $roleName,
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
 * @param  array<int, string>  $abilities
 */
function createSupplierApiToken(User $user, array $abilities = ['suppliers:manage']): string
{
    return $user->createToken('test-token', $abilities, now()->addHour())->plainTextToken;
}

function createSupplierApiRecord(int $tenantId, string $name = 'Supplier API Test'): Supplier
{
    return Supplier::query()->create([
        'tenant_id' => $tenantId,
        'name' => $name,
        'phone' => '081234567890',
        'email' => 'supplier@example.test',
        'address' => 'Test address',
        'is_active' => true,
    ]);
}

it('returns 401 when API login credentials are invalid', function () {
    $this->postJson(route('api.v1.login'), [
        'email' => 'missing@example.test',
        'password' => 'incorrect',
        'device_name' => 'Postman',
    ])->assertUnauthorized();
});

it('issues a short-lived Sanctum bearer token for an active account', function () {
    ['user' => $user] = createSupplierApiUser('owner', ['product.manage']);

    $response = $this->postJson(route('api.v1.login'), [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'Postman',
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.token_type', 'Bearer')
        ->assertJsonPath('data.user.id', $user->id);

    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
    $this->assertDatabaseHas('personal_access_tokens', [
        'tokenable_id' => $user->id,
        'name' => 'Postman',
    ]);
});

it('returns 401 when supplier routes receive no bearer token', function () {
    $this->getJson(route('api.v1.suppliers.index'))
        ->assertUnauthorized();
});

it('returns the supplier collection to an owner with the required permission', function () {
    ['tenant' => $tenant, 'user' => $user] = createSupplierApiUser('owner', ['product.manage']);
    $supplier = createSupplierApiRecord($tenant->id);

    $this->withToken(createSupplierApiToken($user))
        ->getJson(route('api.v1.suppliers.index'))
        ->assertOk()
        ->assertJsonPath('data.0.id', $supplier->id)
        ->assertJsonPath('data.0.name', $supplier->name);
});

it('returns a supplier detail to an authorized tenant owner', function () {
    ['tenant' => $tenant, 'user' => $user] = createSupplierApiUser('owner', ['product.manage']);
    $supplier = createSupplierApiRecord($tenant->id);

    $this->withToken(createSupplierApiToken($user))
        ->getJson(route('api.v1.suppliers.show', $supplier))
        ->assertOk()
        ->assertJsonPath('data.id', $supplier->id)
        ->assertJsonPath('data.name', $supplier->name);
});

it('returns 403 when a non-owner role requests suppliers', function () {
    ['user' => $user] = createSupplierApiUser('cashier', ['product.manage']);

    $this->withToken(createSupplierApiToken($user))
        ->getJson(route('api.v1.suppliers.index'))
        ->assertForbidden();
});

it('returns 403 when an owner lacks product.manage permission', function () {
    ['user' => $user] = createSupplierApiUser('owner', []);

    $this->withToken(createSupplierApiToken($user))
        ->getJson(route('api.v1.suppliers.index'))
        ->assertForbidden();
});

it('returns 403 when the bearer token lacks the supplier ability', function () {
    ['user' => $user] = createSupplierApiUser('owner', ['product.manage']);

    $this->withToken(createSupplierApiToken($user, []))
        ->getJson(route('api.v1.suppliers.index'))
        ->assertForbidden();
});

it('creates a supplier in the token owner tenant and ignores a submitted tenant id', function () {
    ['tenant' => $tenant, 'user' => $user] = createSupplierApiUser('owner', ['product.manage']);
    $otherTenant = Tenant::query()->create([
        'name' => 'Other Supplier Tenant',
        'code' => Str::uuid()->toString(),
    ]);

    $this->withToken(createSupplierApiToken($user))
        ->postJson(route('api.v1.suppliers.store'), [
            'name' => 'New Supplier',
            'email' => 'new-supplier@example.test',
            'tenant_id' => $otherTenant->id,
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'New Supplier');

    $this->assertDatabaseHas('suppliers', [
        'name' => 'New Supplier',
        'tenant_id' => $tenant->id,
    ]);
});

it('returns 422 when supplier input is invalid', function () {
    ['user' => $user] = createSupplierApiUser('owner', ['product.manage']);

    $this->withToken(createSupplierApiToken($user))
        ->postJson(route('api.v1.suppliers.store'), [
            'name' => 'Invalid Supplier',
            'email' => 'not-an-email',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);

    $this->assertDatabaseMissing('suppliers', ['name' => 'Invalid Supplier']);
});

it('updates a supplier without allowing a tenant change', function () {
    ['tenant' => $tenant, 'user' => $user] = createSupplierApiUser('owner', ['product.manage']);
    $otherTenant = Tenant::query()->create([
        'name' => 'Other Supplier Tenant',
        'code' => Str::uuid()->toString(),
    ]);
    $supplier = createSupplierApiRecord($tenant->id);

    $this->withToken(createSupplierApiToken($user))
        ->patchJson(route('api.v1.suppliers.update', $supplier), [
            'name' => 'Updated Supplier',
            'tenant_id' => $otherTenant->id,
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Updated Supplier');

    $this->assertDatabaseHas('suppliers', [
        'id' => $supplier->id,
        'tenant_id' => $tenant->id,
        'name' => 'Updated Supplier',
    ]);
});

it('returns 404 when a user requests another tenant supplier', function () {
    ['user' => $user] = createSupplierApiUser('owner', ['product.manage']);
    $otherTenant = Tenant::query()->create([
        'name' => 'Other Supplier Tenant',
        'code' => Str::uuid()->toString(),
    ]);
    $supplier = createSupplierApiRecord($otherTenant->id);

    $this->withToken(createSupplierApiToken($user))
        ->getJson(route('api.v1.suppliers.show', $supplier))
        ->assertNotFound();
});

it('soft deletes an authorized supplier and returns no content', function () {
    ['tenant' => $tenant, 'user' => $user] = createSupplierApiUser('owner', ['product.manage']);
    $supplier = createSupplierApiRecord($tenant->id);

    $this->withToken(createSupplierApiToken($user))
        ->deleteJson(route('api.v1.suppliers.destroy', $supplier))
        ->assertNoContent();

    $this->assertSoftDeleted($supplier);
});

it('revokes the current bearer token on logout', function () {
    ['user' => $user] = createSupplierApiUser('owner', ['product.manage']);
    $token = createSupplierApiToken($user);

    $this->withToken($token)
        ->postJson(route('api.v1.logout'))
        ->assertNoContent();

    $this->assertDatabaseCount('personal_access_tokens', 0);
});
