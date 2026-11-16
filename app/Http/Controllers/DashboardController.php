<?php

namespace App\Http\Controllers;

use App\Models\DailyStoreSummary;
use App\Models\Employee;
use App\Models\Inventory;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $period = $request->string('period', 'day')->toString();

        if (! in_array($period, ['day', 'week', 'month'], true)) {
            throw ValidationException::withMessages(['period' => 'Periode tidak valid.']);
        }

        $user = $request->user();
        $storeId = $request->integer('store') ?: $request->integer('store_id') ?: null;

        if (! $user->hasAnyRole(['owner', 'admin']) && $storeId === null) {
            throw ValidationException::withMessages(['store_id' => 'Pilih cabang yang dapat Anda akses.']);
        }

        $cacheKey = "dashboard:{$user->tenant_id}:".($storeId ?? 'all').":{$period}";
        $data = Cache::remember($cacheKey, 60, function () use ($storeId, $period): array {
            $today = now()->startOfDay();
            $start = match ($period) {
                'week' => $today->copy()->subDays(6),
                'month' => $today->copy()->startOfMonth(),
                default => $today,
            };
            $end = $today->copy()->endOfDay();

            $summaryQuery = DailyStoreSummary::query()
                ->whereBetween('summary_date', [$start->toDateString(), $end->toDateString()]);

            if ($storeId !== null) {
                $summaryQuery->where('store_id', $storeId);
            }

            $summaries = $summaryQuery
                ->selectRaw('summary_date, SUM(total_sales) AS total_sales, SUM(total_transactions) AS total_transactions')
                ->groupBy('summary_date')
                ->orderBy('summary_date')
                ->get();

            if ($summaries->isEmpty()) {
                $salesByDate = Transaction::query()
                    ->where('status', 'completed')
                    ->whereBetween('created_at', [$start, $end])
                    ->when($storeId !== null, fn (Builder $query) => $query->where('store_id', $storeId))
                    ->selectRaw('DATE(created_at) AS summary_date, SUM(total_amount) AS total_sales, COUNT(*) AS total_transactions')
                    ->groupByRaw('DATE(created_at)')
                    ->orderBy('summary_date')
                    ->get();
            } else {
                $salesByDate = $summaries;
            }

            $transactionQuery = Transaction::query()
                ->where('status', 'completed')
                ->whereBetween('created_at', [$today->copy()->startOfDay(), $today->copy()->endOfDay()]);
            $inventoryQuery = Inventory::query()->whereColumn('quantity', '<=', 'min_stock');
            $employeeQuery = Employee::query()->where('is_active', true);

            foreach ([&$transactionQuery, &$inventoryQuery, &$employeeQuery] as $query) {
                if ($storeId !== null) {
                    $query->where('store_id', $storeId);
                }
            }

            $summaryToday = DailyStoreSummary::query()
                ->whereDate('summary_date', $today->toDateString())
                ->when($storeId !== null, fn (Builder $query) => $query->where('store_id', $storeId))
                ->selectRaw('SUM(total_sales) AS total_sales, SUM(total_transactions) AS total_transactions')
                ->first();

            $salesToday = $summaryToday?->total_sales;
            $transactionsToday = $summaryToday?->total_transactions;

            if ($salesToday === null) {
                $salesToday = $transactionQuery->sum('total_amount');
                $transactionsToday = $transactionQuery->count();
            }

            return [
                'kpi' => [
                    'sales_today' => (string) $salesToday,
                    'transactions_today' => (int) $transactionsToday,
                    'low_stock_count' => $inventoryQuery->count(),
                    'active_employees' => $employeeQuery->count(),
                ],
                'chart' => $salesByDate->map(fn ($row): array => [
                    'date' => Carbon::parse($row->summary_date)->toDateString(),
                    'sales' => (string) $row->total_sales,
                    'transactions' => (int) $row->total_transactions,
                ])->all(),
                'period' => $period,
                'store_id' => $storeId,
            ];
        });

        return Inertia::render('Dashboard', $data);
    }
}
