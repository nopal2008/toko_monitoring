<?php

namespace App\Http\Controllers;

use App\Http\Requests\PromotionRequest;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Promotion::class);

        $promotions = Promotion::query()
            ->with(['store:id,name', 'product:id,name,sku'])
            ->latest()
            ->paginate(min(max($request->integer('per_page', 10), 1), 100))
            ->withQueryString();

        return Inertia::render('Promotions/Index', ['promotions' => $promotions]);
    }

    public function create(): Response
    {
        $this->authorize('create', Promotion::class);

        return Inertia::render('Promotions/Form', $this->formOptions());
    }

    public function store(PromotionRequest $request): RedirectResponse
    {
        $this->authorize('create', Promotion::class);
        $data = $request->validated();
        $this->ensureStoreAccess($request, $data['store_id'] ?? null);
        $data['tenant_id'] = $request->user()->tenant_id;
        $data['is_active'] = $data['is_active'] ?? true;
        Promotion::query()->create($data);

        return redirect()->route('promotions.index')->with('success', 'Promosi berhasil dibuat.');
    }

    public function edit(Promotion $promotion): Response
    {
        $this->authorize('update', $promotion);

        return Inertia::render('Promotions/Form', [
            'promotion' => $promotion,
            ...$this->formOptions(),
        ]);
    }

    public function update(PromotionRequest $request, Promotion $promotion): RedirectResponse
    {
        $this->authorize('update', $promotion);
        $data = $request->validated();
        $this->ensureStoreAccess($request, $data['store_id'] ?? null);
        $data['is_active'] = $data['is_active'] ?? false;
        $promotion->update($data);

        return redirect()->route('promotions.index')->with('success', 'Promosi berhasil diperbarui.');
    }

    public function destroy(Promotion $promotion): RedirectResponse
    {
        $this->authorize('delete', $promotion);
        $promotion->delete();

        return redirect()->route('promotions.index')->with('success', 'Promosi dihapus.');
    }

    private function ensureStoreAccess(Request $request, mixed $storeId): void
    {
        if ($storeId === null) {
            return;
        }

        abort_unless($request->user()->canAccessStore((int) $storeId), 403);
    }

    /** @return array{stores: Collection<int, Store>, products: Collection<int, Product>} */
    private function formOptions(): array
    {
        return [
            'stores' => Store::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'products' => Product::query()->where('is_active', true)->orderBy('name')->limit(500)->get(['id', 'name', 'sku']),
        ];
    }
}
