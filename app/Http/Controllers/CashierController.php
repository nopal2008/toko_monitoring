<?php

namespace App\Http\Controllers;

use App\Models\CashierShift;
use App\Models\Product;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashierController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $this->authorize('create', Transaction::class);

        $user = $request->user();

        // Get active shift for user
        $shift = CashierShift::query()
            ->where('user_id', $user->id)
            ->whereNull('closed_at')
            ->latest()
            ->first();

        // Get today's sales stats
        $todayTransactions = Transaction::query()
            ->where('user_id', $user->id)
            ->whereDate('created_at', today())
            ->get();

        $todaySales = [
            'transactionCount' => $todayTransactions->count(),
            'totalAmount' => $todayTransactions->sum('total_amount'),
            'totalDiscount' => $todayTransactions->sum('discount_amount'),
            'averageTransaction' => $todayTransactions->count() > 0
                ? $todayTransactions->sum('total_amount') / $todayTransactions->count()
                : 0,
        ];

        // Get top products sold today
        $topProducts = Product::query()
            ->select([
                'products.id',
                'products.name',
                \DB::raw('SUM(transaction_items.quantity) as quantity_sold'),
                \DB::raw('SUM(transaction_items.subtotal) as total_sales'),
            ])
            ->join('transaction_items', 'products.id', '=', 'transaction_items.product_id')
            ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.user_id', $user->id)
            ->whereDate('transactions.created_at', today())
            ->groupBy('products.id', 'products.name')
            ->orderBy('quantity_sold', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'quantity_sold' => (int) $p->quantity_sold,
                'total_sales' => (float) $p->total_sales,
            ]);

        return Inertia::render('Cashier/Dashboard', [
            'shift' => $shift,
            'todaySales' => $todaySales,
            'topProducts' => $topProducts,
        ]);
    }
}
