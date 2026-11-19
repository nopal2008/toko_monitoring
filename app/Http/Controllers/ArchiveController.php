<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Employee;
use App\Models\Product;
use App\Models\Store;
use App\Models\Supplier;
use App\Models\Unit;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArchiveController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $this->authorize('viewAny', Product::class);

        $user = $request->user();

        $archivedCounts = [
            'products' => Product::onlyTrashed()->where('tenant_id', $user->tenant_id)->count(),
            'categories' => Category::onlyTrashed()->where('tenant_id', $user->tenant_id)->count(),
            'suppliers' => Supplier::onlyTrashed()->where('tenant_id', $user->tenant_id)->count(),
            'areas' => Area::onlyTrashed()->where('tenant_id', $user->tenant_id)->count(),
            'warehouses' => Warehouse::onlyTrashed()->where('tenant_id', $user->tenant_id)->count(),
            'brands' => Brand::onlyTrashed()->where('tenant_id', $user->tenant_id)->count(),
            'units' => Unit::onlyTrashed()->where('tenant_id', $user->tenant_id)->count(),
            'stores' => Store::onlyTrashed()->where('tenant_id', $user->tenant_id)->count(),
            'employees' => Employee::onlyTrashed()->where('tenant_id', $user->tenant_id)->count(),
        ];

        return Inertia::render('Dashboard/ArchiveManager', [
            'archivedCounts' => $archivedCounts,
        ]);
    }

    public function restoreAll(Request $request, string $type): RedirectResponse
    {
        $this->authorize('viewAny', Product::class);

        $user = $request->user();
        $tenantId = $user->tenant_id;

        $count = 0;

        match ($type) {
            'products' => $count = Product::onlyTrashed()
                ->where('tenant_id', $tenantId)
                ->restore(),
            'categories' => $count = Category::onlyTrashed()
                ->where('tenant_id', $tenantId)
                ->restore(),
            'suppliers' => $count = Supplier::onlyTrashed()
                ->where('tenant_id', $tenantId)
                ->restore(),
            'areas' => $count = Area::onlyTrashed()
                ->where('tenant_id', $tenantId)
                ->restore(),
            'warehouses' => $count = Warehouse::onlyTrashed()
                ->where('tenant_id', $tenantId)
                ->restore(),
            'brands' => $count = Brand::onlyTrashed()
                ->where('tenant_id', $tenantId)
                ->restore(),
            'units' => $count = Unit::onlyTrashed()
                ->where('tenant_id', $tenantId)
                ->restore(),
            'stores' => $count = Store::onlyTrashed()
                ->where('tenant_id', $tenantId)
                ->restore(),
            'employees' => $count = Employee::onlyTrashed()
                ->where('tenant_id', $tenantId)
                ->restore(),
            default => abort(400, 'Invalid archive type'),
        };

        $typeName = match ($type) {
            'products' => 'produk',
            'categories' => 'kategori',
            'suppliers' => 'supplier',
            'areas' => 'area',
            'warehouses' => 'gudang',
            'brands' => 'merek',
            'units' => 'satuan',
            'stores' => 'cabang',
            'employees' => 'karyawan',
            default => 'item',
        };

        return redirect()->route('archive.dashboard')
            ->with('success', "$count $typeName berhasil dipulihkan dari arsip.");
    }
}
