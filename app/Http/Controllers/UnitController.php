<?php

namespace App\Http\Controllers;

use App\Http\Requests\UnitRequest;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Unit::class);

        $query = Unit::query()->withCount('products');

        if ($request->boolean('archived')) {
            $query->onlyTrashed();
        }

        return Inertia::render('Units/Index', [
            'units' => $query
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
            'showingArchived' => $request->boolean('archived'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Unit::class);

        return Inertia::render('Units/Form');
    }

    public function store(UnitRequest $request): RedirectResponse
    {
        $this->authorize('create', Unit::class);
        Unit::query()->create($request->validated());

        return redirect()->route('units.index')->with('success', 'Satuan berhasil dibuat.');
    }

    public function show(Unit $unit): Response
    {
        $this->authorize('view', $unit);

        return Inertia::render('Units/Show', ['unit' => $unit->loadCount('products')]);
    }

    public function edit(Unit $unit): Response
    {
        $this->authorize('update', $unit);

        return Inertia::render('Units/Form', ['unit' => $unit]);
    }

    public function update(UnitRequest $request, Unit $unit): RedirectResponse
    {
        $this->authorize('update', $unit);
        $unit->update($request->validated());

        return redirect()->route('units.index')->with('success', 'Satuan berhasil diperbarui.');
    }

    public function destroy(Unit $unit): RedirectResponse
    {
        $this->authorize('delete', $unit);
        $unit->delete();

        return redirect()->route('units.index')->with('success', 'Satuan berhasil diarsipkan.');
    }

    public function restore(string $id): RedirectResponse
    {
        $unit = Unit::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $unit);

        $unit->restore();

        return redirect()->route('units.index')->with('success', 'Satuan berhasil dipulihkan.');
    }
}
