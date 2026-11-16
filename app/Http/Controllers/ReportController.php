<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportRequest;
use App\Models\Attendance;
use App\Models\Expense;
use App\Models\Inventory;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function sales(ReportRequest $request): Response
    {
        $filters = $request->validated();
        $groupBy = $filters['group_by'] ?? 'day';
        $tenantId = (int) $request->user()->tenant_id;
        $start = $filters['from'] ?? now()->subDays(29)->toDateString();
        $end = $filters['to'] ?? now()->toDateString();
        $query = $this->salesQuery($tenantId, $groupBy, $start, $end, $filters['store_id'] ?? null);

        return Inertia::render('Reports/Sales', [
            'report' => $query->paginate(min(max((int) ($filters['per_page'] ?? 15), 1), 100))->withQueryString(),
            'filters' => ['from' => $start, 'to' => $end, 'group_by' => $groupBy, 'store_id' => $filters['store_id'] ?? null],
        ]);
    }

    public function inventory(ReportRequest $request): Response
    {
        $filters = $request->validated();
        $query = Inventory::query()
            ->with(['store:id,name', 'product:id,name,sku,unit'])
            ->when(isset($filters['store_id']), fn ($builder) => $builder->where('store_id', $filters['store_id']))
            ->when($request->boolean('low_stock'), fn ($builder) => $builder->whereColumn('quantity', '<=', 'min_stock'))
            ->orderBy('store_id')
            ->orderBy('product_id');

        return Inertia::render('Reports/Inventory', [
            'report' => $query->paginate(min(max((int) ($filters['per_page'] ?? 15), 1), 100))->withQueryString(),
            'filters' => $filters,
        ]);
    }

    public function attendance(ReportRequest $request): Response
    {
        $filters = $request->validated();
        $query = Attendance::query()
            ->with(['employee:id,name,employee_code', 'store:id,name'])
            ->when(isset($filters['store_id']), fn ($builder) => $builder->where('store_id', $filters['store_id']))
            ->when(isset($filters['from']), fn ($builder) => $builder->whereDate('date', '>=', $filters['from']))
            ->when(isset($filters['to']), fn ($builder) => $builder->whereDate('date', '<=', $filters['to']))
            ->when(isset($filters['status']), fn ($builder) => $builder->where('status', $filters['status']))
            ->latest('date');

        return Inertia::render('Reports/Attendance', [
            'report' => $query->paginate(min(max((int) ($filters['per_page'] ?? 15), 1), 100))->withQueryString(),
            'filters' => $filters,
        ]);
    }

    public function expenses(ReportRequest $request): Response
    {
        $filters = $request->validated();
        $query = Expense::query()
            ->with(['store:id,name', 'category:id,name'])
            ->when(isset($filters['store_id']), fn ($builder) => $builder->where('store_id', $filters['store_id']))
            ->when(isset($filters['from']), fn ($builder) => $builder->whereDate('expense_date', '>=', $filters['from']))
            ->when(isset($filters['to']), fn ($builder) => $builder->whereDate('expense_date', '<=', $filters['to']))
            ->when(isset($filters['status']), fn ($builder) => $builder->where('status', $filters['status']))
            ->latest('expense_date');

        return Inertia::render('Reports/Expenses', [
            'report' => $query->paginate(min(max((int) ($filters['per_page'] ?? 15), 1), 100))->withQueryString(),
            'filters' => $filters,
        ]);
    }

    public function export(ReportRequest $request, string $type): StreamedResponse
    {
        abort_unless(in_array($type, ['sales', 'inventory', 'attendance', 'expenses'], true), 404);
        $filters = $request->validated();
        $query = $this->exportQuery($type, (int) $request->user()->tenant_id, $filters);
        $headers = match ($type) {
            'sales' => ['invoice_number', 'store', 'date', 'total_amount', 'status'],
            'inventory' => ['store', 'sku', 'product', 'quantity', 'min_stock'],
            'attendance' => ['employee', 'store', 'date', 'check_in_at', 'check_out_at', 'status'],
            default => ['title', 'store', 'category', 'expense_date', 'amount', 'status'],
        };
        $fileName = "report-{$type}-".now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query, $headers): void {
            $output = fopen('php://output', 'w');

            if ($output === false) {
                throw new \RuntimeException('Unable to open the report output stream.');
            }

            fputcsv($output, $headers);

            foreach ($query->cursor() as $row) {
                $values = array_map(fn (mixed $value): mixed => $this->safeCsvValue($value), (array) $row);
                fputcsv($output, $values);
            }

            fclose($output);
        }, $fileName, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function salesQuery(
        int $tenantId,
        string $groupBy,
        string $from,
        string $to,
        ?int $storeId,
    ): Builder {
        if ($groupBy === 'product') {
            return DB::table('transaction_items')
                ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
                ->where('transactions.tenant_id', $tenantId)
                ->where('transactions.status', 'completed')
                ->whereBetween('transactions.created_at', [$from.' 00:00:00', $to.' 23:59:59'])
                ->when($storeId !== null, fn (Builder $query) => $query->where('transactions.store_id', $storeId))
                ->selectRaw('transaction_items.product_id, transaction_items.product_name, SUM(transaction_items.quantity) AS quantity, SUM(transaction_items.subtotal) AS total_sales')
                ->groupBy('transaction_items.product_id', 'transaction_items.product_name')
                ->orderByDesc('total_sales');
        }

        $query = DB::table('transactions')
            ->where('tenant_id', $tenantId)
            ->where('status', 'completed')
            ->whereBetween('created_at', [$from.' 00:00:00', $to.' 23:59:59'])
            ->when($storeId !== null, fn (Builder $builder) => $builder->where('store_id', $storeId));

        if ($groupBy === 'store') {
            return $query->join('stores', 'stores.id', '=', 'transactions.store_id')
                ->selectRaw('stores.id AS store_id, stores.name AS store_name, SUM(transactions.total_amount) AS total_sales, COUNT(*) AS transactions')
                ->groupBy('stores.id', 'stores.name')
                ->orderByDesc('total_sales');
        }

        return $query
            ->selectRaw('DATE(created_at) AS date, SUM(total_amount) AS total_sales, COUNT(*) AS transactions')
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date');
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function exportQuery(string $type, int $tenantId, array $filters): Builder
    {
        $storeId = $filters['store_id'] ?? null;

        return match ($type) {
            'sales' => DB::table('transactions')
                ->join('stores', 'stores.id', '=', 'transactions.store_id')
                ->where('transactions.tenant_id', $tenantId)
                ->when($storeId !== null, fn (Builder $query) => $query->where('transactions.store_id', $storeId))
                ->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('transactions.created_at', '>=', $filters['from']))
                ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('transactions.created_at', '<=', $filters['to']))
                ->select(['transactions.invoice_number', 'stores.name AS store', 'transactions.created_at AS date', 'transactions.total_amount', 'transactions.status'])
                ->orderBy('transactions.id'),
            'inventory' => DB::table('inventories')
                ->join('stores', 'stores.id', '=', 'inventories.store_id')
                ->join('products', 'products.id', '=', 'inventories.product_id')
                ->where('inventories.tenant_id', $tenantId)
                ->when($storeId !== null, fn (Builder $query) => $query->where('inventories.store_id', $storeId))
                ->select(['stores.name AS store', 'products.sku', 'products.name AS product', 'inventories.quantity', 'inventories.min_stock'])
                ->orderBy('inventories.id'),
            'attendance' => DB::table('attendances')
                ->join('employees', 'employees.id', '=', 'attendances.employee_id')
                ->join('stores', 'stores.id', '=', 'attendances.store_id')
                ->where('attendances.tenant_id', $tenantId)
                ->when($storeId !== null, fn (Builder $query) => $query->where('attendances.store_id', $storeId))
                ->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('attendances.date', '>=', $filters['from']))
                ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('attendances.date', '<=', $filters['to']))
                ->select(['employees.name AS employee', 'stores.name AS store', 'attendances.date', 'attendances.check_in_at', 'attendances.check_out_at', 'attendances.status'])
                ->orderBy('attendances.id'),
            default => DB::table('expenses')
                ->join('stores', 'stores.id', '=', 'expenses.store_id')
                ->join('expense_categories', 'expense_categories.id', '=', 'expenses.expense_category_id')
                ->where('expenses.tenant_id', $tenantId)
                ->when($storeId !== null, fn (Builder $query) => $query->where('expenses.store_id', $storeId))
                ->when(isset($filters['from']), fn (Builder $query) => $query->whereDate('expenses.expense_date', '>=', $filters['from']))
                ->when(isset($filters['to']), fn (Builder $query) => $query->whereDate('expenses.expense_date', '<=', $filters['to']))
                ->select(['expenses.title', 'stores.name AS store', 'expense_categories.name AS category', 'expenses.expense_date', 'expenses.amount', 'expenses.status'])
                ->orderBy('expenses.id'),
        };
    }

    private function safeCsvValue(mixed $value): mixed
    {
        if (! is_string($value) || ! Str::startsWith($value, ['=', '+', '-', '@', "\t", "\r"])) {
            return $value;
        }

        return "'".$value;
    }
}
