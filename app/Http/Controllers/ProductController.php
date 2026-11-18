<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $query = Product::query();

        // Show archived products if requested
        if ($request->boolean('archived')) {
            $query->onlyTrashed();
        }

        return Inertia::render('Products/Index', [
            'products' => $query
                ->with(['category:id,name'])
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->limit(100)->get(['id', 'name']),
            'showingArchived' => $request->boolean('archived'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Product::class);

        return Inertia::render('Products/Form', [
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->limit(100)->get(['id', 'name']),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $this->authorize('create', Product::class);
        $data = $request->validated();
        $storeLinks = $data['stores'] ?? [];
        unset($data['stores']);

        $product = DB::transaction(function () use ($data, $storeLinks, $request): Product {
            $product = Product::query()->create($data);
            $this->syncStoreLinks($product, $storeLinks, (int) $request->user()->tenant_id);

            return $product;
        });

        return redirect()->route('products.show', $product)->with('success', 'Produk berhasil dibuat.');
    }

    public function show(Product $product): Response
    {
        $this->authorize('view', $product);

        return Inertia::render('Products/Show', [
            'product' => $product->load(['category:id,name', 'stores:id,name']),
        ]);
    }

    public function edit(Product $product): Response
    {
        $this->authorize('update', $product);

        return Inertia::render('Products/Form', [
            'product' => $product->load('stores:id,name'),
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->limit(100)->get(['id', 'name']),
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $this->authorize('update', $product);
        $data = $request->validated();
        $storeLinks = $data['stores'] ?? null;
        unset($data['stores']);

        DB::transaction(function () use ($product, $data, $storeLinks, $request): void {
            $product->update($data);

            if ($storeLinks !== null) {
                $this->syncStoreLinks($product, $storeLinks, (int) $request->user()->tenant_id);
            }
        });

        return redirect()->route('products.show', $product)->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->authorize('delete', $product);
        $product->delete();

        return redirect()->route('products.index')->with('success', 'Produk berhasil diarsipkan.');
    }

    public function restore(string $id): RedirectResponse
    {
        $product = Product::onlyTrashed()->findOrFail($id);
        $this->authorize('update', $product);

        $product->restore();

        return redirect()->route('products.index', ['archived' => 1])->with('success', 'Produk berhasil dipulihkan.');
    }

    /**
     * @param  array<int, array{store_id: int, price?: string|null, min_stock?: int|null, is_available?: bool}>  $storeLinks
     */
    private function syncStoreLinks(Product $product, array $storeLinks, int $tenantId): void
    {
        $pivot = [];

        foreach ($storeLinks as $storeLink) {
            $pivot[$storeLink['store_id']] = [
                'tenant_id' => $tenantId,
                'price' => $storeLink['price'] ?? null,
                'min_stock' => $storeLink['min_stock'] ?? null,
                'is_available' => $storeLink['is_available'] ?? true,
            ];
        }

        $product->stores()->sync($pivot);
    }
}
