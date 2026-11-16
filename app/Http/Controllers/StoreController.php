<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequest;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Store::class);

        return Inertia::render('Stores/Index', [
            'stores' => Store::query()
                ->withCount('users')
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Store::class);

        return Inertia::render('Stores/Form');
    }

    public function store(StoreRequest $request): RedirectResponse
    {
        $this->authorize('create', Store::class);
        Store::query()->create($request->validated());

        return redirect()->route('stores.index')->with('success', 'Cabang berhasil dibuat.');
    }

    public function show(Store $store): Response
    {
        $this->authorize('view', $store);

        return Inertia::render('Stores/Show', ['store' => $store->loadCount(['users', 'products'])]);
    }

    public function edit(Store $store): Response
    {
        $this->authorize('update', $store);

        return Inertia::render('Stores/Form', ['store' => $store]);
    }

    public function update(StoreRequest $request, Store $store): RedirectResponse
    {
        $this->authorize('update', $store);
        $store->update($request->validated());

        return redirect()->route('stores.index')->with('success', 'Cabang berhasil diperbarui.');
    }

    public function destroy(Store $store): RedirectResponse
    {
        $this->authorize('delete', $store);
        $store->delete();

        return redirect()->route('stores.index')->with('success', 'Cabang berhasil diarsipkan.');
    }
}
