<?php

namespace App\Http\Controllers;

use App\Http\Requests\ApproveExpenseRequest;
use App\Http\Requests\CreateExpenseRequest;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Expense::class);
        $user = $request->user();
        $storeId = $request->integer('store_id');
        $expenseQuery = Expense::query()
            ->with(['store:id,name', 'category:id,name', 'creator:id,name'])
            ->when($request->filled('from'), fn ($query) => $query->whereDate('expense_date', '>=', $request->input('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('expense_date', '<=', $request->input('to')))
            ->latest('expense_date');

        if ($storeId > 0) {
            $expenseQuery->where('store_id', $storeId);
        } elseif (! $user->hasAnyRole(['owner'])) {
            $expenseQuery->whereIn('store_id', $user->stores()->select('stores.id'));
        }

        $expenses = $expenseQuery
            ->paginate(min(max($request->integer('per_page', 10), 1), 100))
            ->withQueryString();

        return Inertia::render('Expenses/Index', ['expenses' => $expenses]);
    }

    public function store(CreateExpenseRequest $request, ExpenseService $service): RedirectResponse
    {
        $this->authorize('create', Expense::class);
        $expense = $service->create($request->user(), $request->expenseData());
        $attachment = $request->file('attachment');

        if ($attachment !== null) {
            $expense->forceFill([
                'attachment_path' => $attachment->storePublicly('expenses', 'public'),
            ])->save();
        }

        return redirect()->route('expenses.index')->with('success', 'Pengeluaran berhasil diajukan.');
    }

    public function approve(
        ApproveExpenseRequest $request,
        Expense $expense,
        ExpenseService $service,
    ): RedirectResponse {
        $this->authorize('update', $expense);
        $service->decide($expense, $request->user(), $request->string('decision')->toString());

        return redirect()->route('expenses.index')->with('success', 'Keputusan pengeluaran berhasil disimpan.');
    }
}
