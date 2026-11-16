import { Head, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Card, EmptyState, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateOnly, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { DashboardPeriod, DashboardProps } from '@/types/models';

const periods: { value: DashboardPeriod; label: string }[] = [
    { value: 'day', label: 'Hari ini' },
    { value: 'week', label: '7 hari' },
    { value: 'month', label: 'Bulan ini' },
];

function Kpi({ label, value }: { label: string; value: string }) {
    return (
        <Card className="p-5">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
                {value}
            </p>
        </Card>
    );
}

function Dashboard({ kpi, chart, period, store_id }: DashboardProps) {
    const { errors } = usePage().props;
    const errorMessages = Object.values(errors ?? {});

    function changePeriod(value: DashboardPeriod) {
        router.get(
            dashboard.url(),
            { period: value, ...(store_id ? { store_id } : {}) },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const maxSales = Math.max(...chart.map((row) => Number(row.sales)), 0);

    return (
        <>
            <Head title="Dashboard" />
            <PageHeader
                title="Dashboard"
                description="Ringkasan penjualan, stok, dan karyawan."
                actions={
                    <div
                        role="group"
                        aria-label="Periode"
                        className="inline-flex rounded-md border border-slate-300 bg-white p-0.5"
                    >
                        {periods.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                aria-pressed={period === item.value}
                                onClick={() => changePeriod(item.value)}
                                className={cn(
                                    'rounded px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-emerald-600',
                                    period === item.value
                                        ? 'bg-emerald-700 text-white'
                                        : 'text-slate-700 hover:bg-slate-100',
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                }
            />

            {errorMessages.length > 0 && (
                <div
                    role="alert"
                    className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                >
                    {errorMessages.map((message) => (
                        <p key={String(message)}>{String(message)}</p>
                    ))}
                </div>
            )}

            <section
                aria-label="Indikator utama"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                <Kpi
                    label="Penjualan hari ini"
                    value={formatCurrency(kpi.sales_today)}
                />
                <Kpi
                    label="Transaksi hari ini"
                    value={formatNumber(kpi.transactions_today)}
                />
                <Kpi
                    label="Stok di bawah minimum"
                    value={formatNumber(kpi.low_stock_count)}
                />
                <Kpi
                    label="Karyawan aktif"
                    value={formatNumber(kpi.active_employees)}
                />
            </section>

            <Card className="mt-6">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-base font-semibold text-slate-900">
                        Penjualan per hari
                    </h2>
                </div>
                {chart.length === 0 ? (
                    <EmptyState
                        title="Belum ada penjualan pada periode ini"
                        description="Data muncul setelah ada transaksi selesai."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[32rem] text-sm">
                            <thead className="bg-slate-50 text-left text-slate-600">
                                <tr>
                                    <th scope="col" className="px-5 py-3 font-medium">
                                        Tanggal
                                    </th>
                                    <th scope="col" className="px-5 py-3 font-medium">
                                        Penjualan
                                    </th>
                                    <th scope="col" className="px-5 py-3 text-right font-medium">
                                        Transaksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {chart.map((row) => {
                                    const width =
                                        maxSales > 0
                                            ? (Number(row.sales) / maxSales) *
                                              100
                                            : 0;

                                    return (
                                        <tr key={row.date}>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {formatDateOnly(row.date)}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-2 rounded-full bg-emerald-600"
                                                        style={{
                                                            width: `${Math.max(width, 1)}%`,
                                                            maxWidth: '12rem',
                                                        }}
                                                        aria-hidden="true"
                                                    />
                                                    <span className="whitespace-nowrap">
                                                        {formatCurrency(
                                                            row.sales,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {formatNumber(row.transactions)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default Dashboard;
