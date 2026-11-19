import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Eye, Filter, Receipt } from 'lucide-react';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateOnly } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
    index as transactionsIndex,
    show as transactionsShow,
} from '@/routes/transactions';
import type { Paginated } from '@/types/models';

type TransactionRow = {
    id: number;
    invoice_number: string;
    store_id: number;
    user_id: number;
    total_amount: string;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
    store: { id: number; name: string } | null;
    cashier: { id: number; name: string } | null;
};

type Props = {
    transactions: Paginated<TransactionRow>;
};

function StatusBadge({ status }: { status: TransactionRow['status'] }) {
    const config = {
        pending: {
            label: 'Menunggu',
            className: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        completed: {
            label: 'Selesai',
            className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
        cancelled: {
            label: 'Dibatalkan',
            className: 'bg-rose-100 text-rose-800 border-rose-200',
        },
    }[status];

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

function TransactionsIndex({ transactions }: Props) {
    const urlParams = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );
    const [statusFilter, setStatusFilter] = useState(
        urlParams.get('status') ?? '',
    );
    const [fromFilter, setFromFilter] = useState(urlParams.get('from') ?? '');
    const [toFilter, setToFilter] = useState(urlParams.get('to') ?? '');

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            transactionsIndex.url(),
            {
                ...(statusFilter ? { status: statusFilter } : {}),
                ...(fromFilter ? { from: fromFilter } : {}),
                ...(toFilter ? { to: toFilter } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function resetFilter() {
        setStatusFilter('');
        setFromFilter('');
        setToFilter('');
        router.get(
            transactionsIndex.url(),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Transaksi" />
            <PageHeader
                title="Transaksi"
                description="Daftar riwayat transaksi penjualan toko."
            />

            {/* Filter Bar */}
            <Card className="mb-6 p-4">
                <form
                    onSubmit={applyFilter}
                    className="flex flex-wrap items-end gap-3"
                >
                    <div className="w-full sm:w-auto">
                        <label
                            htmlFor="status"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
                            Status
                        </label>
                        <select
                            id="status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        >
                            <option value="">Semua Status</option>
                            <option value="completed">Selesai</option>
                            <option value="pending">Menunggu</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                    </div>

                    <div className="w-full sm:w-auto">
                        <label
                            htmlFor="from"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            id="from"
                            value={fromFilter}
                            onChange={(e) => setFromFilter(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                    </div>

                    <div className="w-full sm:w-auto">
                        <label
                            htmlFor="to"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            id="to"
                            value={toFilter}
                            onChange={(e) => setToFilter(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className={buttonClass('primary', 'h-9 px-3')}
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                        </button>
                        {(statusFilter || fromFilter || toFilter) && (
                            <button
                                type="button"
                                onClick={resetFilter}
                                className={buttonClass('secondary', 'h-9 px-3')}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </Card>

            <Card>
                {transactions.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada transaksi"
                        description="Transaksi penjualan yang tercatat akan muncul di tabel ini."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[44rem] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium tracking-wider text-slate-600 uppercase">
                                <tr>
                                    <th scope="col" className="px-5 py-3">
                                        No. Invoice
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Toko
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Kasir
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right"
                                    >
                                        Total
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Status
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Tanggal
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right"
                                    >
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.data.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="transition hover:bg-slate-50/50"
                                    >
                                        <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <Receipt className="h-4 w-4 text-slate-400" />
                                                <span>{tx.invoice_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                                            {tx.store?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                                            {tx.cashier?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold whitespace-nowrap text-slate-900">
                                            {formatCurrency(tx.total_amount)}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <StatusBadge status={tx.status} />
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                                            {formatDateOnly(tx.created_at)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <Link
                                                href={transactionsShow.url(
                                                    tx.id,
                                                )}
                                                className={buttonClass(
                                                    'secondary',
                                                    'h-8 px-2.5 text-xs',
                                                )}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>Detail</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination
                    links={transactions.links}
                    from={transactions.from}
                    to={transactions.to}
                    total={transactions.total}
                />
            </Card>
        </>
    );
}

TransactionsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default TransactionsIndex;
