<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\DailyStoreSummary;
use App\Models\Employee;
use App\Models\Inventory;
use App\Models\Store;
use App\Models\Transaction;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
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
        $tenantId = (int) $user->tenant_id;
        $role = $user->getRoleNames()->first() ?? 'staff';
        $isTenantWide = $user->hasAnyRole(['owner', 'admin']);
        $availableStores = $isTenantWide
            ? Store::query()->where('tenant_id', $tenantId)->where('is_active', true)->orderBy('name')->get(['id', 'name'])
            : $user->stores()->where('stores.tenant_id', $tenantId)->where('stores.is_active', true)->orderBy('stores.name')->get(['stores.id', 'stores.name']);
        $availableStoreIds = $availableStores->pluck('id')->map(fn ($id): int => (int) $id)->all();

        if ($role === 'staff') {
            $employeeStoreIds = Employee::query()
                ->where('tenant_id', $tenantId)
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->pluck('store_id')
                ->map(fn ($id): int => (int) $id)
                ->all();
            $availableStoreIds = array_values(array_unique([...$availableStoreIds, ...$employeeStoreIds]));
        }

        $requestedStoreId = $request->integer('store') ?: $request->integer('store_id') ?: null;

        if ($requestedStoreId !== null && ! in_array($requestedStoreId, $availableStoreIds, true)) {
            abort(403, 'Anda tidak memiliki akses ke cabang tersebut.');
        }

        $storeIds = $requestedStoreId === null
            ? $availableStoreIds
            : [$requestedStoreId];
        $storeIds = array_values(array_unique($storeIds));
        $cacheKey = 'dashboard:'.$tenantId.':'.$user->id.':'.$role.':'.implode(',', $storeIds).':'.$period;

        $data = Cache::remember($cacheKey, 60, function () use ($user, $tenantId, $role, $period, $storeIds, $requestedStoreId): array {
            $today = now()->startOfDay();
            $start = match ($period) {
                'week' => $today->copy()->subDays(6),
                'month' => $today->copy()->startOfMonth(),
                default => $today,
            };
            $end = $today->copy()->endOfDay();
            $isStaff = $role === 'staff';
            $isCashier = $role === 'cashier';
            $canViewBranchSales = in_array($role, ['owner', 'admin', 'area_manager'], true);
            $canViewOperations = in_array($role, ['owner', 'admin', 'area_manager', 'store_manager'], true);
            $dateSales = $isStaff
                ? collect()
                : $this->salesByDate($tenantId, $storeIds, $start, $end, $isCashier ? (int) $user->id : null);
            $attendanceChart = $isStaff || $canViewOperations
                ? $this->attendanceByDate($tenantId, $storeIds, $start, $end, $isStaff ? (int) $user->id : null)
                : collect();
            $salesToday = $isStaff
                ? ['sales' => 0, 'transactions' => 0]
                : $this->salesToday($tenantId, $storeIds, $today, $end, $isCashier ? (int) $user->id : null);
            $completedToday = $salesToday['transactions'];
            $totalSalesToday = $salesToday['sales'];
            $employeesQuery = Employee::query()
                ->where('tenant_id', $tenantId)
                ->where('is_active', true)
                ->whereIn('store_id', $storeIds);
            $inventoryQuery = Inventory::query()
                ->where('tenant_id', $tenantId)
                ->whereIn('store_id', $storeIds)
                ->whereColumn('quantity', '<=', 'min_stock');
            $storeSales = $canViewBranchSales
                ? $this->salesByStore($tenantId, $storeIds, $start, $end)
                : collect();
            $attendanceToday = Attendance::query()
                ->where('tenant_id', $tenantId)
                ->whereIn('store_id', $storeIds)
                ->whereDate('date', $today->toDateString());
            $userAttendance = Attendance::query()
                ->where('tenant_id', $tenantId)
                ->whereIn('employee_id', Employee::query()
                    ->where('tenant_id', $tenantId)
                    ->where('user_id', $user->id)
                    ->select('id'));

            $kpi = [
                'sales_today' => (string) $totalSalesToday,
                'transactions_today' => $completedToday,
                'low_stock_count' => $canViewOperations ? $inventoryQuery->count() : 0,
                'active_employees' => $canViewOperations ? $employeesQuery->count() : 0,
                'active_stores' => $canViewBranchSales
                    ? Store::query()->where('tenant_id', $tenantId)->whereIn('id', $storeIds)->where('is_active', true)->count()
                    : 0,
                'late_attendance_today' => $canViewOperations ? (clone $attendanceToday)->where('status', 'late')->count() : 0,
                'staff_days_this_month' => (clone $userAttendance)->whereBetween('date', [now()->startOfMonth()->toDateString(), $today->toDateString()])->count(),
                'staff_late_days_this_month' => (clone $userAttendance)->whereBetween('date', [now()->startOfMonth()->toDateString(), $today->toDateString()])->where('status', 'late')->count(),
                'staff_work_minutes_today' => (int) (clone $userAttendance)->whereDate('date', $today->toDateString())->sum('work_minutes'),
                'average_transaction' => $completedToday > 0 ? (string) ($totalSalesToday / $completedToday) : '0',
            ];

            return [
                'role' => $role,
                'kpi' => $kpi,
                'chart' => $dateSales->map(fn ($row): array => [
                    'date' => Carbon::parse($row->date)->toDateString(),
                    'sales' => (string) $row->sales,
                    'transactions' => (int) $row->transactions,
                ])->all(),
                'attendance_chart' => $attendanceChart->map(fn ($row): array => [
                    'date' => Carbon::parse($row->date)->toDateString(),
                    'present' => (int) $row->present,
                    'late' => (int) $row->late,
                ])->all(),
                'store_chart' => $storeSales->map(fn ($row): array => [
                    'name' => (string) $row->name,
                    'sales' => (string) $row->sales,
                    'transactions' => (int) $row->transactions,
                ])->all(),
                'payment_chart' => $role === 'cashier'
                    ? $this->paymentsByMethod($tenantId, $storeIds, $start, $end, (int) $user->id)
                    : [],
                'period' => $period,
                'store_id' => $requestedStoreId,
                'stores' => $this->availableStoreOptions($tenantId, $storeIds),
            ];
        });

        return Inertia::render('Dashboard', $data);
    }

    /**
     * @param  list<int>  $storeIds
     */
    private function salesQuery(int $tenantId, array $storeIds, CarbonInterface $start, CarbonInterface $end, ?int $cashierId = null): Builder
    {
        return Transaction::query()
            ->where('transactions.tenant_id', $tenantId)
            ->whereIn('transactions.store_id', $storeIds)
            ->where('transactions.status', 'completed')
            ->whereBetween('transactions.created_at', [$start, $end])
            ->when($cashierId !== null, fn (Builder $query) => $query->where('transactions.user_id', $cashierId));
    }

    /**
     * @param  list<int>  $storeIds
     * @return Collection<int, object>
     */
    private function salesByDate(int $tenantId, array $storeIds, CarbonInterface $start, CarbonInterface $end, ?int $cashierId): Collection
    {
        if ($cashierId === null) {
            $summaries = DailyStoreSummary::query()
                ->where('tenant_id', $tenantId)
                ->whereIn('store_id', $storeIds)
                ->whereBetween('summary_date', [$start->toDateString(), $end->toDateString()])
                ->selectRaw('summary_date AS date, SUM(total_sales) AS sales, SUM(total_transactions) AS transactions')
                ->groupBy('summary_date')
                ->orderBy('date')
                ->get();

            if ($summaries->isNotEmpty()) {
                return $summaries;
            }
        }

        return $this->salesQuery($tenantId, $storeIds, $start, $end, $cashierId)
            ->selectRaw('DATE(transactions.created_at) AS date, SUM(transactions.total_amount) AS sales, COUNT(*) AS transactions')
            ->groupByRaw('DATE(transactions.created_at)')
            ->orderBy('date')
            ->get();
    }

    /**
     * @param  list<int>  $storeIds
     * @return Collection<int, object>
     */
    private function salesByStore(int $tenantId, array $storeIds, CarbonInterface $start, CarbonInterface $end): Collection
    {
        $summaries = DailyStoreSummary::query()
            ->where('daily_store_summaries.tenant_id', $tenantId)
            ->whereIn('daily_store_summaries.store_id', $storeIds)
            ->whereBetween('daily_store_summaries.summary_date', [$start->toDateString(), $end->toDateString()])
            ->join('stores', 'stores.id', '=', 'daily_store_summaries.store_id')
            ->selectRaw('stores.name, SUM(daily_store_summaries.total_sales) AS sales, SUM(daily_store_summaries.total_transactions) AS transactions')
            ->groupBy('stores.id', 'stores.name')
            ->orderByDesc('sales')
            ->get();

        if ($summaries->isNotEmpty()) {
            return $summaries;
        }

        return $this->salesQuery($tenantId, $storeIds, $start, $end)
            ->join('stores', 'stores.id', '=', 'transactions.store_id')
            ->selectRaw('stores.name, SUM(transactions.total_amount) AS sales, COUNT(*) AS transactions')
            ->groupBy('stores.id', 'stores.name')
            ->orderByDesc('sales')
            ->get();
    }

    /**
     * @param  list<int>  $storeIds
     * @return array{sales: int|float, transactions: int}
     */
    private function salesToday(int $tenantId, array $storeIds, CarbonInterface $start, CarbonInterface $end, ?int $cashierId): array
    {
        if ($cashierId === null) {
            $summary = DailyStoreSummary::query()
                ->where('tenant_id', $tenantId)
                ->whereIn('store_id', $storeIds)
                ->whereDate('summary_date', $start->toDateString())
                ->selectRaw('SUM(total_sales) AS sales, SUM(total_transactions) AS transactions')
                ->first();

            if ($summary?->sales !== null) {
                return [
                    'sales' => $summary->sales,
                    'transactions' => (int) $summary->transactions,
                ];
            }
        }

        $query = $this->salesQuery($tenantId, $storeIds, $start, $end, $cashierId);

        return [
            'sales' => (clone $query)->sum('total_amount'),
            'transactions' => (clone $query)->count(),
        ];
    }

    /**
     * @param  list<int>  $storeIds
     * @return Collection<int, object>
     */
    private function attendanceByDate(int $tenantId, array $storeIds, CarbonInterface $start, CarbonInterface $end, ?int $userId): Collection
    {
        $employeeIds = Employee::query()
            ->where('tenant_id', $tenantId)
            ->when($userId !== null, fn (Builder $query) => $query->where('user_id', $userId))
            ->when($userId === null, fn (Builder $query) => $query->whereIn('store_id', $storeIds))
            ->select('id');

        return Attendance::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('employee_id', $employeeIds)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->selectRaw("DATE(date) AS date, SUM(CASE WHEN status IN ('present', 'late') THEN 1 ELSE 0 END) AS present, SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late")
            ->groupByRaw('DATE(date)')
            ->orderBy('date')
            ->get();
    }

    /**
     * @param  list<int>  $storeIds
     * @return list<array{label: string, transactions: int}>
     */
    private function paymentsByMethod(int $tenantId, array $storeIds, CarbonInterface $start, CarbonInterface $end, int $cashierId): array
    {
        return $this->salesQuery($tenantId, $storeIds, $start, $end, $cashierId)
            ->selectRaw('payment_method AS label, COUNT(*) AS transactions')
            ->groupBy('payment_method')
            ->orderBy('payment_method')
            ->get()
            ->map(fn ($row): array => [
                'label' => ucfirst((string) $row->label),
                'transactions' => (int) $row->transactions,
            ])
            ->all();
    }

    /**
     * @param  list<int>  $storeIds
     * @return list<array{id: int, name: string}>
     */
    private function availableStoreOptions(int $tenantId, array $storeIds): array
    {
        return Store::query()
            ->where('tenant_id', $tenantId)
            ->whereIn('id', $storeIds)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Store $store): array => ['id' => $store->id, 'name' => $store->name])
            ->all();
    }
}
