import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, Banknote, Receipt, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    SalesTrendChart,
    TransactionsChart,
} from '@/components/charts/dashboard-charts';
import type { ChartRow } from '@/components/charts/dashboard-charts';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

function Dashboard({ kpi, chart, period, store_id }: DashboardProps) {
    const { errors } = usePage().props;
    const errorMessages = Object.values(errors ?? {});
    const [loading, setLoading] = useState(false);

    function changePeriod(value: DashboardPeriod) {
        if (value === period || loading) {
            return;
        }

        router.get(
            dashboard.url(),
            { period: value, ...(store_id ? { store_id } : {}) },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    }

    const rows: ChartRow[] = chart.map((row) => ({
        date: row.date,
        sales: Number(row.sales),
        transactions: row.transactions,
    }));
    const periodTotal = rows.reduce((sum, row) => sum + row.sales, 0);

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
                        className="inline-flex rounded-lg border border-border bg-muted p-1"
                    >
                        {periods.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                aria-pressed={period === item.value}
                                onClick={() => changePeriod(item.value)}
                                className={cn(
                                    'relative h-8 rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none',
                                    period === item.value
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {period === item.value && (
                                    <motion.span
                                        layoutId="period-pill"
                                        className="absolute inset-0 rounded-md bg-card shadow-soft"
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                    />
                                )}
                                <span className="relative">{item.label}</span>
                            </button>
                        ))}
                    </div>
                }
            />

            {errorMessages.length > 0 && (
                <div
                    role="alert"
                    className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-fg"
                >
                    {errorMessages.map((message) => (
                        <p key={String(message)}>{String(message)}</p>
                    ))}
                </div>
            )}

            <section
                aria-label="Indikator utama"
                className="grid gap-4 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4"
            >
                <StatCard
                    icon={Banknote}
                    label="Penjualan hari ini"
                    value={Number(kpi.sales_today)}
                    format={formatCurrency}
                />
                <StatCard
                    icon={Receipt}
                    tone="info"
                    label="Transaksi hari ini"
                    value={kpi.transactions_today}
                    format={formatNumber}
                />
                <StatCard
                    icon={AlertTriangle}
                    tone="warning"
                    label="Stok di bawah minimum"
                    value={kpi.low_stock_count}
                    format={formatNumber}
                />
                <StatCard
                    icon={Users}
                    tone="success"
                    label="Karyawan aktif"
                    value={kpi.active_employees}
                    format={formatNumber}
                />
            </section>

            <div className="mt-6 grid gap-4 lg:grid-cols-3 lg:gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div>
                            <CardTitle>Tren penjualan</CardTitle>
                            <CardDescription>
                                Total periode:{' '}
                                <span className="font-mono tabular-nums">
                                    {formatCurrency(periodTotal)}
                                </span>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <div className="p-5 lg:p-6">
                        {loading ? (
                            <Skeleton className="h-72 w-full lg:h-80" />
                        ) : rows.length === 0 ? (
                            <EmptyState
                                title="Belum ada penjualan"
                                description="Grafik muncul setelah ada transaksi selesai pada periode ini."
                            />
                        ) : (
                            <SalesTrendChart data={rows} />
                        )}
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <div>
                            <CardTitle>Jumlah transaksi</CardTitle>
                            <CardDescription>Per hari</CardDescription>
                        </div>
                    </CardHeader>
                    <div className="p-5 lg:p-6">
                        {loading ? (
                            <Skeleton className="h-72 w-full lg:h-80" />
                        ) : rows.length === 0 ? (
                            <EmptyState title="Belum ada transaksi" />
                        ) : (
                            <TransactionsChart data={rows} />
                        )}
                    </div>
                </Card>
            </div>

            {rows.length > 0 && !loading && (
                <Card className="mt-6">
                    <details className="group">
                        <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none lg:px-6">
                            Lihat data dalam bentuk tabel
                        </summary>
                        <div className="overflow-x-auto border-t border-border">
                            <table className="w-full min-w-[28rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="h-11 px-5 font-medium lg:px-6">Tanggal</th>
                                        <th scope="col" className="h-11 px-5 text-right font-medium">Penjualan</th>
                                        <th scope="col" className="h-11 px-5 text-right font-medium lg:px-6">Transaksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {rows.map((row) => (
                                        <tr key={row.date} className="h-12 transition-colors hover:bg-muted/40">
                                            <td className="px-5 whitespace-nowrap lg:px-6">{formatDateOnly(row.date)}</td>
                                            <td className="px-5 text-right font-mono whitespace-nowrap tabular-nums">
                                                {formatCurrency(row.sales)}
                                            </td>
                                            <td className="px-5 text-right font-mono tabular-nums lg:px-6">
                                                {formatNumber(row.transactions)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                </Card>
            )}
        </>
    );
}

Dashboard.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default Dashboard;
