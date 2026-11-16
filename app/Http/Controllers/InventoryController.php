<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdjustInventoryRequest;
use App\Models\Inventory;
use App\Services\AdjustInventoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Inventory::class);
        $user = $request->user();
        $storeId = $request->integer('store_id');
        $inventoryQuery = Inventory::query()
            ->with(['product:id,name,sku,unit', 'store:id,name'])
            ->when($request->boolean('low_stock'), fn ($query) => $query->whereColumn('quantity', '<=', 'min_stock'));

        if ($storeId > 0) {
            $inventoryQuery->where('store_id', $storeId);
        } elseif (! $user->hasAnyRole(['owner', 'admin'])) {
            $inventoryQuery->whereIn('store_id', $user->stores()->select('stores.id'));
        }

        $inventories = $inventoryQuery
            ->orderBy('store_id')
            ->orderBy('product_id')
            ->paginate(min(max($request->integer('per_page', 10), 1), 100))
            ->withQueryString();

        return Inertia::render('Inventories/Index', ['inventories' => $inventories]);
    }

    public function adjust(AdjustInventoryRequest $request, AdjustInventoryService $service): RedirectResponse
    {
        $this->authorize('create', Inventory::class);
        $service->adjust($request->user(), $request->adjustmentData());

        return redirect()->route('inventories.index', ['store_id' => $request->integer('store_id')])
            ->with('success', 'Stok berhasil disesuaikan.');
    }
}
