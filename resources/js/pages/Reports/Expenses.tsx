import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import { ReportTabs } from '@/components/report-tabs';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateOnly } from '@/lib/format';
import { expenses as reportsExpenses } from '@/routes/reports';
import type { Paginated } from '@/types/models';

type ExpenseReportRow = {
    id: number;
    title: string;
    amount: string;
    expense_date: string;
    status: 'pending' | 'approved' | 'rejected';
    store: { id: number; name: string } | null;
    category: { id: number; name: string } | null;
};

type Props = {
    report: Paginated<ExpenseReportRow>;
    filters: {
        from?: string;
        to?: string;
        status?: string;
        store_id?: number;
    };
};

function ReportsExpenses({ report, filters }: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            reportsExpenses.url(),
            {
                ...(from ? { from } : {}),
                ...(to ? { to } : {}),
                ...(status ? { status } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Laporan Pengeluaran" />
            <PageHeader
                title="Laporan Pengeluaran Operasional"
                description="Rekap biaya dan pengeluaran operasional seluruh cabang toko."
            />

            <ReportTabs current="expenses" filters={{ from, to, status }} />

            {/* Filter */}
            <Card className="mb-6 p-4">
                <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-3">
                    <div>
                        <label htmlFor="from" className="mb-1 block text-xs font-medium text-slate-700">
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            id="from"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="to" className="mb-1 block text-xs font-medium text-slate-700">
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            id="to"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="mb-1 block text-xs font-medium text-slate-700">
                            Status
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        >
                            <option value="">Semua Status</option>
                            <option value="approved">Disetujui</option>
                            <option value="pending">Menunggu</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>

                    <button type="submit" className={buttonClass('primary', 'h-9 px-3')}>
                        <Filter className="h-4 w-4" />
                        <span>Terapkan</span>
                    </button>
                </form>
            </Card>

            <Card>
                {report.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada data pengeluaran"
                        description="Belum ada catatan pengeluaran pada rentang waktu yang dipilih."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[40rem] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                                <tr>
                                    <th scope="col" className="px-5 py-3">Judul Pengeluaran</th>
                                    <th scope="col" className="px-5 py-3">Cabang Toko</th>
                                    <th scope="col" className="px-5 py-3">Tanggal</th>
                                    <th scope="col" className="px-5 py-3 text-right">Nominal</th>
                                    <th scope="col" className="px-5 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {report.data.map((row) => (
                                    <tr key={row.id} className="transition hover:bg-slate-50/50">
                                        <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                            {row.title}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                                            {row.store?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                                            {formatDateOnly(row.expense_date)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                                            {formatCurrency(row.amount)}
                                        </td>
                                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    row.status === 'approved'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : row.status === 'pending'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                }`}
                                            >
                                                {row.status === 'approved'
                                                    ? 'Disetujui'
                                                    : row.status === 'pending'
                                                    ? 'Menunggu'
                                                    : 'Ditolak'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination
                    links={report.links}
                    from={report.from}
                    to={report.to}
                    total={report.total}
                />
            </Card>
        </>
    );
}

ReportsExpenses.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ReportsExpenses;
