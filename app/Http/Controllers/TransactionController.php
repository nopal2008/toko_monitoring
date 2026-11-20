<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelTransactionRequest;
use App\Http\Requests\CreateTransactionRequest;
use App\Models\Setting;
use App\Models\Transaction;
use App\Services\CancelTransactionService;
use App\Services\CreateTransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Transaction::class);
        $user = $request->user();
        $storeId = $request->integer('store_id');
        $transactionsQuery = Transaction::query()
            ->with(['store:id,name', 'cashier:id,name'])
            ->when($request->filled('from'), fn ($query) => $query->whereDate('created_at', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('created_at', '<=', $request->date('to')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest();

        if ($storeId > 0) {
            $transactionsQuery->where('store_id', $storeId);
        } elseif ($user->hasAnyRole(['cashier', 'staff'])) {
            $transactionsQuery->where('user_id', $user->id);
        } elseif (! $user->hasAnyRole(['owner'])) {
            $transactionsQuery->whereIn('store_id', $user->stores()->select('stores.id'));
        }

        $transactions = $transactionsQuery
            ->paginate(min(max($request->integer('per_page', 10), 1), 100))
            ->withQueryString();

        return Inertia::render('Transactions/Index', ['transactions' => $transactions]);
    }

    public function store(CreateTransactionRequest $request, CreateTransactionService $service): RedirectResponse
    {
        $this->authorize('create', Transaction::class);
        $transaction = $service->create($request->user(), $request->transactionData());

        if ($request->boolean('print_receipt')) {
            return redirect()->route('transactions.receipt', $transaction)
                ->with('success', 'Transaksi berhasil disimpan.');
        }

        return redirect()->route('transactions.show', $transaction)->with('success', 'Transaksi berhasil disimpan.');
    }

    public function show(Request $request, Transaction $transaction): Response
    {
        $this->authorize('view', $transaction);

        return Inertia::render('Transactions/Show', [
            'transaction' => $transaction->load([
                'items.product:id,name,sku',
                'payments',
                'store:id,name,address,phone',
                'cashier:id,name',
            ]),
        ]);
    }

    public function receipt(Request $request, Transaction $transaction): Response
    {
        $this->authorize('view', $transaction);

        return Inertia::render('Transactions/Receipt', [
            'transaction' => $transaction->load([
                'items.product:id,name,sku',
                'payments',
                'store:id,name,code,address,city,phone',
                'cashier:id,name',
            ]),
            'settings' => [
                'footer' => $this->settingValue($transaction->tenant_id, 'receipt', 'footer_note'),
                'tax_percentage' => $this->settingValue($transaction->tenant_id, 'receipt', 'tax_percentage'),
            ],
        ]);
    }

    private function settingValue(int $tenantId, string $group, string $key): ?string
    {
        $value = Setting::query()
            ->where('tenant_id', $tenantId)
            ->where('setting_group', $group)
            ->where('setting_key', $key)
            ->value('value');

        if (is_array($value)) {
            $value = $value['value'] ?? $value[0] ?? null;
        }

        return is_scalar($value) ? (string) $value : null;
    }

    public function cancel(
        CancelTransactionRequest $request,
        Transaction $transaction,
        CancelTransactionService $service,
    ): RedirectResponse {
        $this->authorize('update', $transaction);
        $service->cancel($transaction, $request->user(), $request->string('reason')->toString());

        return redirect()->route('transactions.show', $transaction)->with('success', 'Transaksi berhasil dibatalkan.');
    }
}
