<?php

namespace App\Http\Controllers;

use App\Http\Requests\BrandRequest;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Brand::class);

        $query = Brand::query()->withCount('products');

        if ($request->boolean('archived')) {
            $query->onlyTrashed();
        }

        return Inertia::render('Brands/Index', [
            'brands' => $query
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
            'showingArchived' => $request->boolean('archived'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Brand::class);

        return Inertia::render('Brands/Form');
    }

    public function store(BrandRequest $request): RedirectResponse
    {
        $this->authorize('create', Brand::class);
        Brand::query()->create($request->validated());

        return redirect()->route('brands.index')->with('success', 'Merek berhasil dibuat.');
    }

    public function show(Brand $brand): Response
    {
        $this->authorize('view', $brand);

        return Inertia::render('Brands/Show', ['brand' => $brand->loadCount('products')]);
    }

    public function edit(Brand $brand): Response
    {
        $this->authorize('update', $brand);

        return Inertia::render('Brands/Form', ['brand' => $brand]);
    }

    public function update(BrandRequest $request, Brand $brand): RedirectResponse
    {
        $this->authorize('update', $brand);
        $brand->update($request->validated());

        return redirect()->route('brands.index')->with('success', 'Merek berhasil diperbarui.');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        $this->authorize('delete', $brand);
        $brand->delete();

        return redirect()->route('brands.index')->with('success', 'Merek berhasil diarsipkan.');
    }

    public function restore(string $id): RedirectResponse
    {
        $brand = Brand::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $brand);

        $brand->restore();

        return redirect()->route('brands.index')->with('success', 'Merek berhasil dipulihkan.');
    }
}
