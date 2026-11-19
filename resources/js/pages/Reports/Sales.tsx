import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Filter } from 'lucide-react';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import { ReportTabs } from '@/components/report-tabs';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateOnly, formatNumber } from '@/lib/format';
import { sales as reportsSales } from '@/routes/reports';
import type { Paginated } from '@/types/models';

type SalesRow = {
    date?: string;
    store_id?: number;
    store_name?: string;
    product_id?: number;
    product_name?: string;
    total_sales: string;
    transactions?: number;
    quantity?: number;
};

type Props = {
    report: Paginated<SalesRow>;
    filters: {
        from: string;
        to: string;
        group_by: 'day' | 'store' | 'product';
        store_id: number | null;
    };
};

function ReportsSales({ report, filters }: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [groupBy, setGroupBy] = useState(filters.group_by ?? 'day');

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            reportsSales.url(),
            { from, to, group_by: groupBy },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Laporan Penjualan" />
            <PageHeader
                title="Laporan Penjualan"
                description="Analisis pendapatan dan volume transaksi berdasarkan periode, cabang, atau produk."
            />

            <ReportTabs
                current="sales"
                filters={{ from, to, group_by: groupBy }}
            />

            {/* Filter Bar */}
            <Card className="mb-6 p-4">
                <form
                    onSubmit={applyFilter}
                    className="flex flex-wrap items-end gap-3"
                >
                    <div>
                        <label
                            htmlFor="group_by"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
                            Kelompokkan Berdasarkan
                        </label>
                        <select
                            id="group_by"
                            value={groupBy}
                            onChange={(e) =>
                                setGroupBy(
                                    e.target.value as
                                        | 'day'
                                        | 'store'
                                        | 'product',
                                )
                            }
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        >
                            <option value="day">Harian (Tanggal)</option>
                            <option value="store">Cabang / Toko</option>
                            <option value="product">Produk Terlaris</option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="from"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
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
                        <label
                            htmlFor="to"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
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

                    <button
                        type="submit"
                        className={buttonClass('primary', 'h-9 px-3')}
                    >
                        <Filter className="h-4 w-4" />
                        <span>Terapkan</span>
                    </button>
                </form>
            </Card>

            <Card>
                {report.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada data penjualan"
                        description="Tidak ada transaksi yang selesai pada rentang tanggal yang dipilih."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[36rem] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium tracking-wider text-slate-600 uppercase">
                                <tr>
                                    {groupBy === 'day' && (
                                        <th scope="col" className="px-5 py-3">
                                            Tanggal
                                        </th>
                                    )}
                                    {groupBy === 'store' && (
                                        <th scope="col" className="px-5 py-3">
                                            Cabang Toko
                                        </th>
                                    )}
                                    {groupBy === 'product' && (
                                        <th scope="col" className="px-5 py-3">
                                            Nama Produk
                                        </th>
                                    )}
                                    {groupBy === 'product' && (
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-right"
                                        >
                                            Kuantitas Terjual
                                        </th>
                                    )}
                                    {groupBy !== 'product' && (
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-right"
                                        >
                                            Jumlah Transaksi
                                        </th>
                                    )}
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right"
                                    >
                                        Total Pendapatan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {report.data.map((row, idx) => (
                                    <tr
                                        key={idx}
                                        className="transition hover:bg-slate-50/50"
                                    >
                                        {groupBy === 'day' && (
                                            <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-900">
                                                {row.date
                                                    ? formatDateOnly(row.date)
                                                    : '-'}
                                            </td>
                                        )}
                                        {groupBy === 'store' && (
                                            <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-900">
                                                {row.store_name ?? '-'}
                                            </td>
                                        )}
                                        {groupBy === 'product' && (
                                            <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-900">
                                                {row.product_name ?? '-'}
                                            </td>
                                        )}
                                        {groupBy === 'product' && (
                                            <td className="px-5 py-3.5 text-right font-medium whitespace-nowrap text-slate-700">
                                                {formatNumber(
                                                    row.quantity ?? 0,
                                                )}
                                            </td>
                                        )}
                                        {groupBy !== 'product' && (
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap text-slate-600">
                                                {formatNumber(
                                                    row.transactions ?? 0,
                                                )}
                                            </td>
                                        )}
                                        <td className="px-5 py-3.5 text-right font-semibold whitespace-nowrap text-emerald-700">
                                            {formatCurrency(row.total_sales)}
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

ReportsSales.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ReportsSales;
