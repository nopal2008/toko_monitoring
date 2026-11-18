<?php

namespace App\Http\Controllers;

use App\Http\Requests\WarehouseRequest;
use App\Models\Store;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Warehouse::class);

        $query = Warehouse::query()->with(['store:id,name', 'tenant:id,name']);

        if ($request->boolean('archived')) {
            $query->onlyTrashed();
        }

        return Inertia::render('Warehouses/Index', [
            'warehouses' => $query
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
            'showingArchived' => $request->boolean('archived'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Warehouse::class);

        return Inertia::render('Warehouses/Form', [
            'stores' => Store::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->limit(200)
                ->get(['id', 'name', 'code']),
        ]);
    }

    public function store(WarehouseRequest $request): RedirectResponse
    {
        $this->authorize('create', Warehouse::class);
        Warehouse::query()->create($request->validated());

        return redirect()->route('warehouses.index')->with('success', 'Gudang berhasil dibuat.');
    }

    public function show(Warehouse $warehouse): Response
    {
        $this->authorize('view', $warehouse);

        return Inertia::render('Warehouses/Show', ['warehouse' => $warehouse->load(['store:id,name', 'tenant:id,name'])]);
    }

    public function edit(Warehouse $warehouse): Response
    {
        $this->authorize('update', $warehouse);

        return Inertia::render('Warehouses/Form', [
            'warehouse' => $warehouse,
            'stores' => Store::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->limit(200)
                ->get(['id', 'name', 'code']),
        ]);
    }

    public function update(WarehouseRequest $request, Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('update', $warehouse);
        $warehouse->update($request->validated());

        return redirect()->route('warehouses.index')->with('success', 'Gudang berhasil diperbarui.');
    }

    public function destroy(Warehouse $warehouse): RedirectResponse
    {
        $this->authorize('delete', $warehouse);
        $warehouse->delete();

        return redirect()->route('warehouses.index')->with('success', 'Gudang berhasil diarsipkan.');
    }

    public function restore(string $id): RedirectResponse
    {
        $warehouse = Warehouse::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $warehouse);

        $warehouse->restore();

        return redirect()->route('warehouses.index')->with('success', 'Gudang berhasil dipulihkan.');
    }
}
