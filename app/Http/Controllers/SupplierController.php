<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Supplier::class);

        return Inertia::render('Suppliers/Index', [
            'suppliers' => Supplier::query()
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Supplier::class);

        return Inertia::render('Suppliers/Form');
    }

    public function store(SupplierRequest $request): RedirectResponse
    {
        $this->authorize('create', Supplier::class);
        Supplier::query()->create($request->validated());

        return redirect()->route('suppliers.index')->with('success', 'Pemasok berhasil dibuat.');
    }

    public function show(Supplier $supplier): Response
    {
        $this->authorize('view', $supplier);

        return Inertia::render('Suppliers/Show', ['supplier' => $supplier]);
    }

    public function edit(Supplier $supplier): Response
    {
        $this->authorize('update', $supplier);

        return Inertia::render('Suppliers/Form', ['supplier' => $supplier]);
    }

    public function update(SupplierRequest $request, Supplier $supplier): RedirectResponse
    {
        $this->authorize('update', $supplier);
        $supplier->update($request->validated());

        return redirect()->route('suppliers.index')->with('success', 'Pemasok berhasil diperbarui.');
    }

    public function destroy(Supplier $supplier): RedirectResponse
    {
        $this->authorize('delete', $supplier);
        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Pemasok berhasil diarsipkan.');
    }
}
