<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('create', Transaction::class);

        $user = $request->user();
        $storeId = $request->integer('store_id');

        // If no store selected, get first accessible store
        if ($storeId === 0) {
            if ($user->hasAnyRole(['owner', 'admin'])) {
                $firstStore = Store::query()->first();
                $storeId = $firstStore?->id ?? 0;
            } else {
                $firstStore = $user->stores()->first();
                $storeId = $firstStore?->id ?? 0;
            }
        }

        // Get products available at selected store
        $productsQuery = Product::query()
            ->with(['category:id,name'])
            ->where('is_active', true);

        if ($storeId > 0) {
            $productsQuery->whereHas('stores', function ($query) use ($storeId) {
                $query->where('stores.id', $storeId)
                    ->where('product_store.is_available', true);
            })->with(['stores' => function ($query) use ($storeId) {
                $query->where('stores.id', $storeId)
                    ->select('stores.id', 'stores.name');
            }]);
        }

        // Filter by category if provided
        if ($request->filled('category_id')) {
            $productsQuery->where('category_id', $request->integer('category_id'));
        }

        // Search by name or SKU
        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $productsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        $products = $productsQuery->limit(100)->get();

        // Get stores accessible by user - fix ambiguous column issue
        if ($user->hasAnyRole(['owner', 'admin'])) {
            $stores = Store::query()
                ->where('is_active', true)
                ->select(['id', 'name'])
                ->get();
        } else {
            $stores = $user->stores()
                ->where('stores.is_active', true)
                ->select(['stores.id', 'stores.name'])
                ->get();
        }

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Pos/Index', [
            'products' => $products,
            'stores' => $stores,
            'categories' => $categories,
            'selectedStoreId' => $storeId,
        ]);
    }
}
