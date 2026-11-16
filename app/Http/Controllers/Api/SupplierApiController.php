<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class SupplierApiController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Supplier::class);

        return SupplierResource::collection(
            Supplier::query()
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
        );
    }

    public function store(SupplierRequest $request): JsonResponse
    {
        $this->authorize('create', Supplier::class);

        $supplier = Supplier::query()->create($request->validated());

        return (new SupplierResource($supplier))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Supplier $supplier): SupplierResource
    {
        $this->authorize('view', $supplier);

        return new SupplierResource($supplier);
    }

    public function update(SupplierRequest $request, Supplier $supplier): SupplierResource
    {
        $this->authorize('update', $supplier);
        $supplier->update($request->validated());

        return new SupplierResource($supplier->refresh());
    }

    public function destroy(Supplier $supplier): Response
    {
        $this->authorize('delete', $supplier);
        $supplier->delete();

        return response()->noContent();
    }
}
