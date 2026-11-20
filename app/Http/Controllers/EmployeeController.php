<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeRequest;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Employee::class);
        $user = $request->user();
        $storeId = $request->integer('store_id');
        $employeeQuery = Employee::query()
            ->with(['store:id,name', 'user:id,name,email'])
            ->latest();

        if ($storeId > 0) {
            $employeeQuery->where('store_id', $storeId);
        } elseif (! $user->hasAnyRole(['owner'])) {
            $employeeQuery->whereIn('store_id', $user->stores()->select('stores.id'));
        }

        if ($request->boolean('archived')) {
            $employeeQuery->onlyTrashed();
        }

        return Inertia::render('Employees/Index', [
            'employees' => $employeeQuery
                ->paginate(min(max($request->integer('per_page', 10), 1), 100))
                ->withQueryString(),
            'showingArchived' => $request->boolean('archived'),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Employee::class);

        return Inertia::render('Employees/Form');
    }

    public function store(EmployeeRequest $request): RedirectResponse
    {
        $this->authorize('create', Employee::class);
        Employee::query()->create($request->validated());

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil dibuat.');
    }

    public function show(Employee $employee): Response
    {
        $this->authorize('view', $employee);

        return Inertia::render('Employees/Show', ['employee' => $employee->load(['store:id,name', 'user:id,name,email'])]);
    }

    public function edit(Employee $employee): Response
    {
        $this->authorize('update', $employee);

        return Inertia::render('Employees/Form', ['employee' => $employee]);
    }

    public function update(EmployeeRequest $request, Employee $employee): RedirectResponse
    {
        $this->authorize('update', $employee);
        $employee->update($request->validated());

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil diperbarui.');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $this->authorize('delete', $employee);
        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil diarsipkan.');
    }

    public function restore(string $id): RedirectResponse
    {
        $employee = Employee::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $employee);

        $employee->restore();

        return redirect()->route('employees.index')->with('success', 'Karyawan berhasil dipulihkan.');
    }
}
