<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class AggregateDailySummaryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct()
    {
        $this->onQueue('reports');
    }

    public function handle(): void
    {
        $summaryDate = now()->subDay()->toDateString();
        $stores = DB::table('stores')
            ->whereNull('deleted_at')
            ->get(['id', 'tenant_id']);

        foreach ($stores as $store) {
            $sales = DB::table('transactions')
                ->where('tenant_id', $store->tenant_id)
                ->where('store_id', $store->id)
                ->where('status', 'completed')
                ->whereDate('created_at', $summaryDate)
                ->selectRaw('COALESCE(SUM(total_amount), 0) AS total_sales, COUNT(*) AS total_transactions, COALESCE(SUM(discount_amount), 0) AS total_discount')
                ->first();

            $items = DB::table('transaction_items')
                ->join('transactions', 'transactions.id', '=', 'transaction_items.transaction_id')
                ->where('transactions.tenant_id', $store->tenant_id)
                ->where('transactions.store_id', $store->id)
                ->where('transactions.status', 'completed')
                ->whereDate('transactions.created_at', $summaryDate)
                ->selectRaw('COALESCE(SUM(transaction_items.quantity), 0) AS total_items_sold, COALESCE(SUM(transaction_items.subtotal - transaction_items.cost_price * transaction_items.quantity), 0) AS gross_profit')
                ->first();

            $expenses = DB::table('expenses')
                ->where('tenant_id', $store->tenant_id)
                ->where('store_id', $store->id)
                ->where('status', 'approved')
                ->whereDate('expense_date', $summaryDate)
                ->sum('amount');

            $lowStockCount = DB::table('inventories')
                ->where('tenant_id', $store->tenant_id)
                ->where('store_id', $store->id)
                ->whereColumn('quantity', '<=', 'min_stock')
                ->count();

            $attendance = DB::table('attendances')
                ->where('tenant_id', $store->tenant_id)
                ->where('store_id', $store->id)
                ->whereDate('date', $summaryDate)
                ->selectRaw("SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count, SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count")
                ->first();

            DB::table('daily_store_summaries')->updateOrInsert(
                ['store_id' => $store->id, 'summary_date' => $summaryDate],
                [
                    'tenant_id' => $store->tenant_id,
                    'total_sales' => $sales->total_sales,
                    'total_transactions' => $sales->total_transactions,
                    'total_items_sold' => $items->total_items_sold,
                    'total_discount' => $sales->total_discount,
                    'total_expenses' => $expenses,
                    'gross_profit' => $items->gross_profit,
                    'low_stock_count' => $lowStockCount,
                    'attendance_present_count' => $attendance->present_count ?? 0,
                    'attendance_late_count' => $attendance->late_count ?? 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        }
    }
}
