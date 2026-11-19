import { Head, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    Banknote,
    CalendarCheck,
    Clock3,
    Receipt,
    Store,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    AttendanceTrendChart,
    DistributionChart,
    SalesTrendChart,
    StoreSalesChart,
} from '@/components/charts/dashboard-charts';
import type {
    AttendanceChartRow,
    ChartRow,
    DistributionChartRow,
    StoreChartRow,
} from '@/components/charts/dashboard-charts';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

const roleLabels: Record<string, string> = {
    owner: 'Pemilik usaha',
    admin: 'Administrator',
    area_manager: 'Area manager',
    store_manager: 'Store manager',
    cashier: 'Kasir',
    staff: 'Staf',
};

function Dashboard({
    role,
    kpi,
    chart,
    attendance_chart,
    store_chart,
    payment_chart,
    period,
    store_id,
    stores,
}: DashboardProps) {
    const { errors } = usePage().props;
    const errorMessages = Object.values(errors ?? {});
    const [loading, setLoading] = useState(false);
    const isStaff = role === 'staff';
    const isCashier = role === 'cashier';
    const isOwner = role === 'owner' || role === 'admin';
    const isAreaManager = role === 'area_manager';
    const hasSecondaryChart = !isStaff;

    function visitDashboard(
        nextPeriod: DashboardPeriod,
        nextStoreId: number | null,
    ) {
        router.get(
            dashboard.url(),
            {
                period: nextPeriod,
                ...(nextStoreId ? { store_id: nextStoreId } : {}),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    }

    function changePeriod(value: DashboardPeriod) {
        if (value !== period && !loading) {
            visitDashboard(value, store_id);
        }
    }

    function changeStore(value: string) {
        const nextStoreId = value === '' ? null : Number(value);
        if (nextStoreId !== store_id && !loading) {
            visitDashboard(period, nextStoreId);
        }
    }

    const rows: ChartRow[] = chart.map((row) => ({
        date: row.date,
        sales: Number(row.sales),
        transactions: row.transactions,
    }));
    const attendanceRows: AttendanceChartRow[] = attendance_chart;
    const storeRows: StoreChartRow[] = store_chart.map((row) => ({
        ...row,
        sales: Number(row.sales),
    }));
    const paymentRows: DistributionChartRow[] = payment_chart;
    const periodTotal = rows.reduce((sum, row) => sum + row.sales, 0);

    const cards = isStaff
        ? [
              {
                  icon: CalendarCheck,
                  label: 'Hari hadir bulan ini',
                  value: kpi.staff_days_this_month,
                  format: formatNumber,
              },
              {
                  icon: AlertTriangle,
                  tone: 'warning' as const,
                  label: 'Hari terlambat bulan ini',
                  value: kpi.staff_late_days_this_month,
                  format: formatNumber,
              },
              {
                  icon: Clock3,
                  tone: 'info' as const,
                  label: 'Menit kerja hari ini',
                  value: kpi.staff_work_minutes_today,
                  format: formatNumber,
              },
          ]
        : isCashier
          ? [
                {
                    icon: Banknote,
                    label: 'Penjualan saya hari ini',
                    value: Number(kpi.sales_today),
                    format: formatCurrency,
                },
                {
                    icon: Receipt,
                    tone: 'info' as const,
                    label: 'Transaksi saya hari ini',
                    value: kpi.transactions_today,
                    format: formatNumber,
                },
                {
                    icon: Banknote,
                    tone: 'success' as const,
                    label: 'Rata-rata transaksi',
                    value: Number(kpi.average_transaction),
                    format: formatCurrency,
                },
            ]
          : isOwner
            ? [
                  {
                      icon: Banknote,
                      label: 'Penjualan hari ini',
                      value: Number(kpi.sales_today),
                      format: formatCurrency,
                  },
                  {
                      icon: Receipt,
                      tone: 'info' as const,
                      label: 'Transaksi hari ini',
                      value: kpi.transactions_today,
                      format: formatNumber,
                  },
                  {
                      icon: Store,
                      tone: 'success' as const,
                      label: 'Cabang dalam cakupan',
                      value: kpi.active_stores,
                      format: formatNumber,
                  },
                  {
                      icon: AlertTriangle,
                      tone: 'warning' as const,
                      label: 'Stok di bawah minimum',
                      value: kpi.low_stock_count,
                      format: formatNumber,
                  },
              ]
            : [
                  {
                      icon: Banknote,
                      label: 'Penjualan hari ini',
                      value: Number(kpi.sales_today),
                      format: formatCurrency,
                  },
                  {
                      icon: Receipt,
                      tone: 'info' as const,
                      label: 'Transaksi hari ini',
                      value: kpi.transactions_today,
                      format: formatNumber,
                  },
                  {
                      icon: Users,
                      tone: 'success' as const,
                      label: 'Karyawan aktif',
                      value: kpi.active_employees,
                      format: formatNumber,
                  },
                  {
                      icon: AlertTriangle,
                      tone: 'warning' as const,
                      label: isAreaManager
                          ? 'Karyawan terlambat hari ini'
                          : 'Stok di bawah minimum',
                      value: isAreaManager
                          ? kpi.late_attendance_today
                          : kpi.low_stock_count,
                      format: formatNumber,
                  },
              ];

    const roleLabel = roleLabels[role] ?? 'Pengguna';

    return (
        <>
            <Head title="Dashboard" />
            <PageHeader
                title="Dashboard"
                description={`Ringkasan dan pemantauan untuk ${roleLabel.toLowerCase()}.`}
                actions={
                    <div className="flex flex-wrap gap-2">
                        {stores.length > 1 && (
                            <label>
                                <span className="sr-only">Pilih cabang</span>
                                <select
                                    value={store_id ?? ''}
                                    onChange={(event) =>
                                        changeStore(event.target.value)
                                    }
                                    disabled={loading}
                                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                                >
                                    <option value="">Semua cabang saya</option>
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
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
                                            transition={{
                                                duration: 0.2,
                                                ease: 'easeOut',
                                            }}
                                        />
                                    )}
                                    <span className="relative">
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
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
                {cards.map(({ icon, label, value, format, tone }) => (
                    <StatCard
                        key={label}
                        icon={icon}
                        tone={tone}
                        label={label}
                        value={value}
                        format={format}
                    />
                ))}
            </section>

            <div
                className={cn(
                    'mt-6 grid gap-4 lg:gap-6',
                    hasSecondaryChart ? 'lg:grid-cols-3' : 'lg:grid-cols-1',
                )}
            >
                <Card
                    className={hasSecondaryChart ? 'lg:col-span-2' : undefined}
                >
                    <CardHeader>
                        <div>
                            <CardTitle>
                                {isStaff
                                    ? 'Kehadiran harian'
                                    : 'Tren penjualan'}
                            </CardTitle>
                            <CardDescription>
                                {isStaff ? (
                                    'Ringkasan kehadiran dan keterlambatan.'
                                ) : (
                                    <>
                                        Total periode:{' '}
                                        <span className="font-mono tabular-nums">
                                            {formatCurrency(periodTotal)}
                                        </span>
                                    </>
                                )}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <div className="p-5 lg:p-6">
                        {loading ? (
                            <Skeleton className="h-72 w-full lg:h-80" />
                        ) : isStaff ? (
                            attendanceRows.length === 0 ? (
                                <EmptyState
                                    title="Belum ada data kehadiran"
                                    description="Grafik akan tampil setelah data absensi tercatat."
                                />
                            ) : (
                                <AttendanceTrendChart data={attendanceRows} />
                            )
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

                {hasSecondaryChart && (
                    <Card>
                        <CardHeader>
                            <div>
                                <CardTitle>
                                    {isOwner || isAreaManager
                                        ? 'Penjualan per cabang'
                                        : isCashier
                                          ? 'Transaksi per pembayaran'
                                          : 'Kehadiran per hari'}
                                </CardTitle>
                                <CardDescription>
                                    {isOwner || isAreaManager
                                        ? 'Perbandingan pada periode terpilih.'
                                        : isCashier
                                          ? 'Distribusi metode pembayaran.'
                                          : 'Jumlah hadir dan terlambat.'}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <div className="p-5 lg:p-6">
                            {loading ? (
                                <Skeleton className="h-72 w-full lg:h-80" />
                            ) : isOwner || isAreaManager ? (
                                storeRows.length === 0 ? (
                                    <EmptyState title="Belum ada data cabang" />
                                ) : (
                                    <StoreSalesChart data={storeRows} />
                                )
                            ) : isCashier ? (
                                paymentRows.length === 0 ? (
                                    <EmptyState title="Belum ada transaksi" />
                                ) : (
                                    <DistributionChart data={paymentRows} />
                                )
                            ) : attendanceRows.length === 0 ? (
                                <EmptyState title="Belum ada data kehadiran" />
                            ) : (
                                <AttendanceTrendChart data={attendanceRows} />
                            )}
                        </div>
                    </Card>
                )}
            </div>

            {(isStaff ? attendanceRows.length > 0 : rows.length > 0) &&
                !loading && (
                    <Card className="mt-6">
                        <details className="group">
                            <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none lg:px-6">
                                Lihat data dalam bentuk tabel
                            </summary>
                            <div className="overflow-x-auto border-t border-border">
                                <table className="w-full min-w-[28rem] text-sm">
                                    <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="h-11 px-5 font-medium lg:px-6"
                                            >
                                                Tanggal
                                            </th>
                                            {isStaff ? (
                                                <>
                                                    <th
                                                        scope="col"
                                                        className="h-11 px-5 text-right font-medium"
                                                    >
                                                        Hadir
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="h-11 px-5 text-right font-medium lg:px-6"
                                                    >
                                                        Terlambat
                                                    </th>
                                                </>
                                            ) : (
                                                <>
                                                    <th
                                                        scope="col"
                                                        className="h-11 px-5 text-right font-medium"
                                                    >
                                                        Penjualan
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="h-11 px-5 text-right font-medium lg:px-6"
                                                    >
                                                        Transaksi
                                                    </th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {(isStaff ? attendanceRows : rows).map(
                                            (row) => (
                                                <tr
                                                    key={row.date}
                                                    className="h-12 transition-colors hover:bg-muted/40"
                                                >
                                                    <td className="px-5 whitespace-nowrap lg:px-6">
                                                        {formatDateOnly(
                                                            row.date,
                                                        )}
                                                    </td>
                                                    {isStaff ? (
                                                        <>
                                                            <td className="px-5 text-right font-mono tabular-nums">
                                                                {
                                                                    (
                                                                        row as AttendanceChartRow
                                                                    ).present
                                                                }
                                                            </td>
                                                            <td className="px-5 text-right font-mono tabular-nums lg:px-6">
                                                                {
                                                                    (
                                                                        row as AttendanceChartRow
                                                                    ).late
                                                                }
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-5 text-right font-mono whitespace-nowrap tabular-nums">
                                                                {formatCurrency(
                                                                    (
                                                                        row as ChartRow
                                                                    ).sales,
                                                                )}
                                                            </td>
                                                            <td className="px-5 text-right font-mono tabular-nums lg:px-6">
                                                                {formatNumber(
                                                                    (
                                                                        row as ChartRow
                                                                    )
                                                                        .transactions,
                                                                )}
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ),
                                        )}
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
