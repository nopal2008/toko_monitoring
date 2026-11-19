<?php

namespace App\Http\Controllers;

use App\Http\Requests\StockOpnameRequest;
use App\Models\Inventory;
use App\Models\StockOpname;
use App\Models\Warehouse;
use App\Services\StockOpnameService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockOpnameController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Inventory::class);

        $opnames = StockOpname::query()
            ->with(['warehouse:id,name,store_id', 'warehouse.store:id,name', 'counter:id,name'])
            ->latest()
            ->paginate(min(max($request->integer('per_page', 10), 1), 100))
            ->withQueryString();

        return Inertia::render('StockOpnames/Index', ['opnames' => $opnames]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Inventory::class);

        $user = $request->user();
        $warehouseQuery = Warehouse::query()
            ->with(['store:id,name'])
            ->whereNotNull('store_id')
            ->where('is_active', true);

        if (! $user->hasAnyRole(['owner', 'admin'])) {
            $warehouseQuery->whereIn('store_id', $user->stores()->select('stores.id'));
        }

        $inventoryQuery = Inventory::query()
            ->with(['product:id,name,sku,unit', 'store:id,name'])
            ->orderBy('store_id')
            ->orderBy('product_id');

        if (! $user->hasAnyRole(['owner', 'admin'])) {
            $inventoryQuery->whereIn('store_id', $user->stores()->select('stores.id'));
        }

        return Inertia::render('StockOpnames/Create', [
            'warehouses' => $warehouseQuery->orderBy('name')->get(['id', 'name', 'store_id']),
            'inventories' => $inventoryQuery->limit(500)->get(),
        ]);
    }

    public function store(StockOpnameRequest $request, StockOpnameService $service): RedirectResponse
    {
        $this->authorize('create', Inventory::class);
        $opname = $service->create($request->user(), $request->validated());

        return redirect()->route('stock-opnames.show', $opname)
            ->with('success', 'Stock opname berhasil dibuat.');
    }

    public function show(Request $request, StockOpname $stockOpname): Response
    {
        $this->authorize('view', $stockOpname);
        $storeId = $stockOpname->warehouse?->store_id;
        abort_if($storeId !== null && ! $request->user()->canAccessStore((int) $storeId), 403);

        return Inertia::render('StockOpnames/Show', [
            'opname' => $stockOpname->load([
                'items.product:id,name,sku,unit',
                'warehouse:id,name,store_id',
                'warehouse.store:id,name',
                'counter:id,name',
                'approver:id,name',
            ]),
        ]);
    }

    public function post(Request $request, StockOpname $stockOpname, StockOpnameService $service): RedirectResponse
    {
        $this->authorize('update', $stockOpname);
        $service->post($stockOpname, $request->user());

        return redirect()->route('stock-opnames.show', $stockOpname)
            ->with('success', 'Stock opname diposting dan stok telah disesuaikan.');
    }
}
