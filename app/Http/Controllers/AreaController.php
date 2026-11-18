<?php

namespace App\Http\Controllers;

use App\Http\Requests\AreaRequest;
use App\Models\Area;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AreaController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Area::class);

        $query = Area::query()->withCount(['stores', 'warehouses']);

        if ($request->boolean('archived')) {
            $query->onlyTrashed();
        }

        return Inertia::render('Areas/Index', [
            'areas' => $query
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
            'showingArchived' => $request->boolean('archived'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Area::class);

        return Inertia::render('Areas/Form');
    }

    public function store(AreaRequest $request): RedirectResponse
    {
        $this->authorize('create', Area::class);
        Area::query()->create($request->validated());

        return redirect()->route('areas.index')->with('success', 'Area berhasil dibuat.');
    }

    public function show(Area $area): Response
    {
        $this->authorize('view', $area);

        return Inertia::render('Areas/Show', ['area' => $area->loadCount(['stores', 'warehouses'])]);
    }

    public function edit(Area $area): Response
    {
        $this->authorize('update', $area);

        return Inertia::render('Areas/Form', ['area' => $area]);
    }

    public function update(AreaRequest $request, Area $area): RedirectResponse
    {
        $this->authorize('update', $area);
        $area->update($request->validated());

        return redirect()->route('areas.index')->with('success', 'Area berhasil diperbarui.');
    }

    public function destroy(Area $area): RedirectResponse
    {
        $this->authorize('delete', $area);
        $area->delete();

        return redirect()->route('areas.index')->with('success', 'Area berhasil diarsipkan.');
    }

    public function restore(string $id): RedirectResponse
    {
        $area = Area::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $area);

        $area->restore();

        return redirect()->route('areas.index')->with('success', 'Area berhasil dipulihkan.');
    }
}
