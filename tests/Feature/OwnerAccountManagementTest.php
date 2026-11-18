<?php

use App\Models\ImpersonationAudit;
use App\Models\Store;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::query()->create([
        'name' => 'Toko Uji',
        'code' => 'tenant-test',
        'timezone' => 'Asia/Jakarta',
        'currency' => 'IDR',
        'is_active' => true,
    ]);
    $this->owner = User::factory()->create([
        'tenant_id' => $this->tenant->id,
        'is_active' => true,
    ]);
    $this->owner->assignRole('owner');
    $this->actingAs($this->owner);
});

it('limits account management to the active tenant', function () {
    $otherTenant = Tenant::query()->create([
        'name' => 'Tenant Lain',
        'code' => 'tenant-other',
        'timezone' => 'Asia/Jakarta',
        'currency' => 'IDR',
        'is_active' => true,
    ]);
    $otherUser = User::factory()->create(['tenant_id' => $otherTenant->id]);
    $otherUser->assignRole('staff');

    $this->get(route('accounts.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Accounts/Index')
            ->has('accounts.data', 1)
            ->where('accounts.data.0.id', $this->owner->id));

    $this->get(route('accounts.edit', $otherUser))
        ->assertNotFound();
});

it('denies account management to users without the owner role', function () {
    $staff = User::factory()->create([
        'tenant_id' => $this->tenant->id,
        'is_active' => true,
    ]);
    $staff->assignRole('staff');
    $this->actingAs($staff);

    $this->get(route('accounts.index'))->assertForbidden();
});

it('denies access to a deactivated account even when its session still exists', function () {
    $inactiveOwner = User::factory()->create([
        'tenant_id' => $this->tenant->id,
        'is_active' => false,
    ]);
    $inactiveOwner->assignRole('owner');
    $this->actingAs($inactiveOwner);

    $this->get(route('accounts.index'))->assertForbidden();
});

it('creates an account with one role and tenant-scoped store assignments', function () {
    $store = Store::query()->create([
        'tenant_id' => $this->tenant->id,
        'name' => 'Cabang Uji',
        'code' => 'UJI-01',
        'is_active' => true,
    ]);

    $this->post(route('accounts.store'), [
        'name' => 'Kasir Uji',
        'email' => 'cashier@example.test',
        'role' => 'cashier',
        'store_ids' => [$store->id],
        'password' => 'secure-password-2026',
        'password_confirmation' => 'secure-password-2026',
        'is_active' => true,
    ])->assertRedirect(route('accounts.index'));

    $account = User::query()->where('email', 'cashier@example.test')->firstOrFail();
    expect($account->tenant_id)->toBe($this->tenant->id)
        ->and($account->hasRole('cashier'))->toBeTrue()
        ->and($account->stores()->whereKey($store->id)->exists())->toBeTrue();
});

it('blocks removing the last active owner', function () {
    $this->put(route('accounts.update', $this->owner), [
        'name' => $this->owner->name,
        'email' => $this->owner->email,
        'role' => 'staff',
        'store_ids' => [],
        'password' => '',
        'password_confirmation' => '',
        'is_active' => true,
    ])->assertSessionHasErrors('role');
});

it('audits same-tenant impersonation and restores the owner session', function () {
    $target = User::factory()->create([
        'tenant_id' => $this->tenant->id,
        'is_active' => true,
    ]);
    $target->assignRole('staff');

    $this->post(route('accounts.impersonate', $target))
        ->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($target);

    $audit = ImpersonationAudit::query()->where('actor_user_id', $this->owner->id)->firstOrFail();
    expect($audit->target_user_id)->toBe($target->id)
        ->and($audit->target_role)->toBe('staff')
        ->and($audit->ended_at)->toBeNull();

    $this->post(route('impersonation.stop'))
        ->assertRedirect(route('accounts.index'));
    $this->assertAuthenticatedAs($this->owner);
    expect($audit->fresh()->ended_at)->not->toBeNull();
});

it('does not allow impersonating a user from another tenant', function () {
    $otherTenant = Tenant::query()->create([
        'name' => 'Tenant Lain',
        'code' => 'tenant-other',
        'timezone' => 'Asia/Jakarta',
        'currency' => 'IDR',
        'is_active' => true,
    ]);
    $target = User::factory()->create(['tenant_id' => $otherTenant->id]);
    $target->assignRole('staff');

    $this->post(route('accounts.impersonate', $target))
        ->assertNotFound();

    expect(ImpersonationAudit::query()->count())->toBe(0);
    $this->assertAuthenticatedAs($this->owner);
});
