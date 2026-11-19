<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\PosHold;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Setting;
use App\Models\Store;
use App\Models\Transaction;
use App\Services\PosPricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('create', Transaction::class);

        $user = $request->user();
        $storeId = $request->integer('store_id');

        if ($storeId === 0) {
            $storeId = $user->hasAnyRole(['owner', 'admin'])
                ? (int) (Store::query()->value('id') ?? 0)
                : (int) ($user->stores()->value('stores.id') ?? 0);
        }

        $productsQuery = Product::query()
            ->with(['category:id,name'])
            ->where('is_active', true);

        if ($storeId > 0) {
            $productsQuery->whereHas('stores', function ($query) use ($storeId): void {
                $query->where('stores.id', $storeId)
                    ->where('product_store.is_available', true);
            });
        }

        if ($request->filled('category_id')) {
            $productsQuery->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $productsQuery->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        $products = $productsQuery
            ->orderBy('name')
            ->limit(100)
            ->get();

        $stores = $user->hasAnyRole(['owner', 'admin'])
            ? Store::query()->where('is_active', true)->select(['id', 'name'])->get()
            : $user->stores()->where('stores.is_active', true)->select(['stores.id', 'stores.name'])->get();

        $holds = PosHold::query()
            ->where('user_id', $user->id)
            ->when($storeId > 0, fn ($query) => $query->where('store_id', $storeId))
            ->latest()
            ->limit(20)
            ->get(['id', 'label', 'payload', 'created_at']);

        $holdProducts = $this->serializeProducts(
            Product::query()
                ->with(['category:id,name'])
                ->whereIn('id', $holds->flatMap(fn (PosHold $hold): array => collect($hold->payload)->pluck('product_id')->all())->unique())
                ->get(),
            (int) $user->tenant_id,
            $storeId,
        );
        $holdProductsById = collect($holdProducts)->keyBy('id');

        $holds = $holds->map(function (PosHold $hold) use ($holdProductsById): array {
            return [
                'id' => $hold->id,
                'label' => $hold->label,
                'created_at' => $hold->created_at,
                'items' => collect($hold->payload)
                    ->map(fn (array $item): ?array => $holdProductsById->has($item['product_id'])
                        ? ['product' => $holdProductsById->get($item['product_id']), 'quantity' => (int) $item['quantity']]
                        : null)
                    ->filter()
                    ->values()
                    ->all(),
            ];
        });

        $promotions = Promotion::query()
            ->activeNow()
            ->where('tenant_id', $user->tenant_id)
            ->when($storeId > 0, fn ($query) => $query->where(fn ($query) => $query->whereNull('store_id')->orWhere('store_id', $storeId)))
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name', 'type', 'value']);

        return Inertia::render('Pos/Index', [
            'products' => $this->serializeProducts($products, (int) $user->tenant_id, $storeId),
            'stores' => $stores,
            'categories' => Category::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'selectedStoreId' => $storeId,
            'holds' => $holds,
            'promotions' => $promotions,
            'taxPercentage' => $this->taxPercentage((int) $user->tenant_id),
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $this->authorize('create', Transaction::class);

        $validated = $request->validate([
            'store_id' => ['required', 'integer', 'min:1'],
            'query' => ['required', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $query = trim($validated['query']);
        $products = Product::query()
            ->with(['category:id,name'])
            ->where('is_active', true)
            ->where(function ($builder) use ($query): void {
                $builder->where('barcode', $query)
                    ->orWhere('sku', $query)
                    ->orWhere('name', 'like', "%{$query}%");
            })
            ->whereHas('stores', function ($builder) use ($validated): void {
                $builder->where('stores.id', $validated['store_id'])
                    ->where('product_store.is_available', true);
            })
            ->orderByRaw('CASE WHEN barcode = ? THEN 0 WHEN sku = ? THEN 1 ELSE 2 END', [$query, $query])
            ->limit(10)
            ->get();

        return response()->json([
            'products' => $this->serializeProducts($products, (int) $user->tenant_id, (int) $validated['store_id']),
        ]);
    }

    public function quote(Request $request, PosPricingService $pricing): JsonResponse
    {
        $this->authorize('create', Transaction::class);

        $validated = $request->validate([
            'store_id' => ['required', 'integer', 'min:1'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['required', 'integer', 'min:1', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100000'],
            'items.*.discount_amount' => ['nullable', 'decimal:0,2'],
            'discount_amount' => ['nullable', 'decimal:0,2'],
        ]);

        $user = $request->user();
        abort_unless($user->canAccessStore((int) $validated['store_id']), 403);

        $result = $pricing->quote(
            (int) $user->tenant_id,
            (int) $validated['store_id'],
            $validated['items'],
            null,
            null,
            $validated['discount_amount'] ?? null,
        );

        return response()->json([
            'subtotal' => $result['subtotal'],
            'discount' => $result['discount'],
            'tax' => $result['tax'],
            'total' => $result['total'],
            'tax_percentage' => $result['tax_percentage'],
            'promotion_names' => $result['promotion_names'],
            'items' => collect($result['items'])->map(fn (array $item): array => [
                'product_id' => (int) $item['product']->id,
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'discount' => $item['discount'],
                'subtotal' => $item['subtotal'],
                'promotion_name' => $item['promotion_name'],
            ])->values(),
        ]);
    }

    public function storeHold(Request $request): RedirectResponse
    {
        $this->authorize('create', Transaction::class);

        $validated = $request->validate([
            'store_id' => ['required', 'integer', 'min:1'],
            'label' => ['required', 'string', 'max:100'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['required', 'integer', 'min:1', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100000'],
        ]);

        $user = $request->user();
        abort_unless($user->canAccessStore((int) $validated['store_id']), 403);

        PosHold::query()->create([
            'tenant_id' => $user->tenant_id,
            'store_id' => $validated['store_id'],
            'user_id' => $user->id,
            'label' => $validated['label'],
            'payload' => array_map(fn (array $item): array => [
                'product_id' => (int) $item['product_id'],
                'quantity' => (int) $item['quantity'],
            ], $validated['items']),
        ]);

        return redirect()->route('pos.index', ['store_id' => $validated['store_id']])
            ->with('success', 'Transaksi disimpan sebagai draft.');
    }

    public function destroyHold(Request $request, PosHold $hold): RedirectResponse
    {
        $this->authorize('create', Transaction::class);
        abort_unless((int) $hold->user_id === (int) $request->user()->id, 403);
        $hold->delete();

        return redirect()->route('pos.index', ['store_id' => $hold->store_id])
            ->with('success', 'Draft transaksi dihapus.');
    }

    /**
     * @param  Collection<int, Product>  $products
     * @return array<int, array<string, mixed>>
     */
    private function serializeProducts($products, int $tenantId, int $storeId): array
    {
        $productIds = $products->pluck('id');

        $storeProducts = DB::table('product_store')
            ->where('tenant_id', $tenantId)
            ->where('store_id', $storeId)
            ->whereIn('product_id', $productIds)
            ->get()
            ->keyBy('product_id');

        $inventories = Inventory::query()
            ->where('store_id', $storeId)
            ->whereIn('product_id', $productIds)
            ->get()
            ->keyBy('product_id');

        $pricing = app(PosPricingService::class);

        return $products->map(function (Product $product) use ($storeProducts, $inventories, $pricing): array {
            $pivot = $storeProducts->get($product->id);
            $inventory = $inventories->get($product->id);
            $storeProduct = $pivot === null ? null : [
                'price' => $pivot->price,
                'wholesale_price' => $pivot->wholesale_price ?? null,
                'wholesale_min_qty' => $pivot->wholesale_min_qty ?? null,
            ];
            $unitPrice = $pricing->unitPriceFor($product, $storeProduct, 1);

            return [
                'id' => $product->id,
                'category_id' => $product->category_id,
                'name' => $product->name,
                'sku' => $product->sku,
                'barcode' => $product->barcode,
                'unit' => $product->unit,
                'image_path' => $product->image_path ?? null,
                'base_price' => $product->base_price,
                'unit_price' => $unitPrice,
                'price' => number_format($unitPrice / 100, 2, '.', ''),
                'wholesale_price' => $storeProduct['wholesale_price'] ?? null,
                'wholesale_min_qty' => $storeProduct['wholesale_min_qty'] ?? null,
                'stock' => (int) ($inventory->quantity ?? 0),
                'min_stock' => (int) ($inventory->min_stock ?? 0),
                'category' => $product->category,
            ];
        })->values()->all();
    }

    private function taxPercentage(int $tenantId): string
    {
        $value = Setting::query()
            ->where('tenant_id', $tenantId)
            ->where('setting_group', 'receipt')
            ->where('setting_key', 'tax_percentage')
            ->value('value');

        if (is_array($value)) {
            $value = $value['value'] ?? $value[0] ?? null;
        }

        return is_numeric($value) ? number_format((float) $value, 2, '.', '') : '0.00';
    }
}
