<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePurchaseRequest;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Store;
use App\Models\Supplier;
use App\Services\PurchaseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Purchase::class);

        $purchases = Purchase::query()
            ->with(['store:id,name', 'supplier:id,name'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(min(max($request->integer('per_page', 10), 1), 100))
            ->withQueryString();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Purchase::class);

        $stores = $request->user()->hasAnyRole(['owner'])
            ? Store::query()->where('is_active', true)->orderBy('name')->get(['id', 'name'])
            : $request->user()->stores()->where('stores.is_active', true)->orderBy('stores.name')->get(['stores.id', 'stores.name']);

        $suppliers = Supplier::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::query()
            ->with(['category:id,name'])
            ->where('is_active', true)
            ->orderBy('name')
            ->limit(500)
            ->get();

        return Inertia::render('Purchases/Create', [
            'stores' => $stores,
            'suppliers' => $suppliers,
            'products' => $products,
        ]);
    }

    public function store(CreatePurchaseRequest $request, PurchaseService $service): RedirectResponse
    {
        $this->authorize('create', Purchase::class);
        $purchase = $service->create($request->user(), $request->purchaseData());

        return redirect()->route('purchases.show', $purchase)
            ->with('success', 'Pembelian berhasil dicatat.');
    }

    public function show(Request $request, Purchase $purchase): Response
    {
        $this->authorize('view', $purchase);

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase->load([
                'items.product:id,name,sku,unit',
                'store:id,name',
                'supplier:id,name',
                'createdBy:id,name',
            ]),
        ]);
    }

    public function receive(Request $request, Purchase $purchase, PurchaseService $service): RedirectResponse
    {
        $this->authorize('update', $purchase);
        $service->receive($purchase, $request->user());

        return redirect()->route('purchases.show', $purchase)
            ->with('success', 'Pembelian berhasil diterima dan stok diperbarui.');
    }

    public function destroy(Request $request, Purchase $purchase): RedirectResponse
    {
        $this->authorize('delete', $purchase);

        $purchase->delete();

        return redirect()->route('purchases.index')->with('success', 'Pembelian berhasil dibatalkan.');
    }
}
