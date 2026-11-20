<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = (int) $request->user()->tenant_id;
        $search = $request->string('search')->trim()->toString();
        $role = $request->string('role')->toString();

        return Inertia::render('Accounts/Index', [
            'accounts' => User::query()
                ->where('tenant_id', $tenantId)
                ->with(['roles:id,name', 'stores:id,name'])
                ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                }))
                ->when($role !== '', fn (Builder $query) => $query->whereHas('roles', fn (Builder $roles) => $roles->where('name', $role)))
                ->orderBy('name')
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
            'filters' => ['search' => $search, 'role' => $role],
            'roles' => $this->availableRoles($tenantId),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Accounts/Form', [
            'roles' => $this->availableRoles((int) $request->user()->tenant_id),
            'stores' => $this->availableStores((int) $request->user()->tenant_id),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = (int) $request->user()->tenant_id;
        $validated = $request->validate($this->rules($tenantId, null));

        DB::transaction(function () use ($validated, $tenantId): void {
            $account = User::query()->create([
                'tenant_id' => $tenantId,
                'name' => $validated['name'],
                'email' => mb_strtolower($validated['email']),
                'phone' => $validated['phone'] ?? null,
                'password' => $validated['password'],
                'is_active' => $validated['is_active'],
            ]);

            $account->syncRoles([$validated['role']]);
            $account->stores()->sync($validated['store_ids'] ?? []);
        });

        return redirect()->route('accounts.index')->with('success', 'Akun berhasil dibuat.');
    }

    public function edit(Request $request, User $account): Response
    {
        $this->ensureTenantAccount($request, $account);

        return Inertia::render('Accounts/Form', [
            'account' => $account->load(['roles:id,name', 'stores:id,name']),
            'roles' => $this->availableRoles((int) $request->user()->tenant_id),
            'stores' => $this->availableStores((int) $request->user()->tenant_id),
        ]);
    }

    public function update(Request $request, User $account): RedirectResponse
    {
        $this->ensureTenantAccount($request, $account);
        $validated = $request->validate($this->rules((int) $request->user()->tenant_id, $account));
        $this->ensureAnotherOwnerRemains($account, $validated['role'], $validated['is_active']);

        DB::transaction(function () use ($account, $validated): void {
            $account->fill([
                'name' => $validated['name'],
                'email' => mb_strtolower($validated['email']),
                'phone' => $validated['phone'] ?? null,
                'is_active' => $validated['is_active'],
            ]);

            if (($validated['password'] ?? null) !== null) {
                $account->password = $validated['password'];
            }

            $account->save();
            $account->syncRoles([$validated['role']]);
            $account->stores()->sync($validated['store_ids'] ?? []);
        });

        return redirect()->route('accounts.index')->with('success', 'Akun berhasil diperbarui.');
    }

    public function destroy(Request $request, User $account): RedirectResponse
    {
        $this->ensureTenantAccount($request, $account);
        abort_if($account->is($request->user()), 403, 'Akun yang sedang digunakan tidak dapat diarsipkan.');
        $this->ensureAnotherOwnerRemains($account, null, false);
        $account->delete();

        return redirect()->route('accounts.index')->with('success', 'Akun berhasil diarsipkan.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(int $tenantId, ?User $account): array
    {
        $passwordRules = $account === null
            ? ['required', 'string', 'min:12', 'confirmed']
            : ['nullable', 'string', 'min:12', 'confirmed'];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($account?->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['required', 'string', Rule::in(collect($this->availableRoles($tenantId))->pluck('name')->all())],
            'store_ids' => ['sometimes', 'array'],
            'store_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('stores', 'id')->where('tenant_id', $tenantId),
            ],
            'password' => $passwordRules,
            'password_confirmation' => [$account === null ? 'required' : 'nullable', 'string'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function availableRoles(int $tenantId): array
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->where(fn (Builder $query) => $query->whereNull('tenant_id')->orWhere('tenant_id', $tenantId))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Role $role): array => ['id' => $role->id, 'name' => $role->name])
            ->all();
    }

    /**
     * @return list<array{id: int, name: string, code: string}>
     */
    private function availableStores(int $tenantId): array
    {
        return Store::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn (Store $store): array => ['id' => $store->id, 'name' => $store->name, 'code' => $store->code])
            ->all();
    }

    private function ensureTenantAccount(Request $request, User $account): void
    {
        abort_unless($account->tenant_id === $request->user()->tenant_id, 404);
    }

    private function ensureAnotherOwnerRemains(User $account, ?string $nextRole, bool $isActive): void
    {
        if (! $account->is_active || ! $account->hasAnyRole(['owner'])) {
            return;
        }

        if ($isActive && in_array($nextRole, ['owner'], true)) {
            return;
        }

        $anotherOwnerExists = User::query()
            ->where('tenant_id', $account->tenant_id)
            ->where('is_active', true)
            ->where('id', '!=', $account->getKey())
            ->whereHas('roles', fn (Builder $query) => $query->whereIn('name', ['owner']))
            ->exists();

        if (! $anotherOwnerExists) {
            throw ValidationException::withMessages([
                'role' => 'Tenant harus memiliki setidaknya satu akun owner atau admin yang aktif.',
            ]);
        }
    }
}
