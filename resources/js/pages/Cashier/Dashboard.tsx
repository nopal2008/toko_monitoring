import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    BarChart3,
    Clock,
    LogOut,
    RotateCw,
    ShoppingCart,
    TrendingUp,
} from 'lucide-react';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { CashierShift } from '@/types/models';

type Props = {
    shift: CashierShift | null;
    todaySales: {
        transactionCount: number;
        totalAmount: number;
        totalDiscount: number;
        averageTransaction: number;
    };
    topProducts: Array<{
        id: number;
        name: string;
        quantity_sold: number;
        total_sales: number;
    }>;
};

function CashierDashboard({ shift, todaySales, topProducts }: Props) {
    const handleOpenShift = () => {
        router.post('/cashier-shifts/open', {
            opening_balance: 0,
        });
    };

    const handleCloseShift = () => {
        if (confirm('Tutup shift kasir? Pastikan saldo sudah sesuai.')) {
            router.post(`/cashier-shifts/${shift?.id}/close`, {
                closing_balance: 0,
            });
        }
    };

    return (
        <>
            <Head title="Kasir - Dashboard" />
            <PageHeader
                title="Dashboard Kasir"
                description="Kelola transaksi penjualan dan shift kasir"
                actions={
                    <div className="flex gap-2">
                        {!shift ? (
                            <button
                                type="button"
                                onClick={handleOpenShift}
                                className={buttonClass('primary')}
                            >
                                <Clock className="size-4" />
                                Buka Shift
                            </button>
                        ) : (
                            <>
                                <Link
                                    href="/pos"
                                    className={buttonClass('primary')}
                                >
                                    <ShoppingCart className="size-4" />
                                    Mulai Transaksi
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleCloseShift}
                                    className={buttonClass('secondary')}
                                >
                                    <LogOut className="size-4" />
                                    Tutup Shift
                                </button>
                            </>
                        )}
                    </div>
                }
            />

            {/* Shift Status */}
            {shift ? (
                <Card className="mb-6 border-l-4 border-l-green-500 bg-green-50 p-6 dark:bg-green-950">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-green-900 dark:text-green-200">
                                Shift Aktif
                            </h3>
                            <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300">
                                Shift #{shift.id}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Dibuka:{' '}
                                {new Date(shift.opened_at).toLocaleTimeString(
                                    'id-ID',
                                )}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase">
                                Saldo Pembukaan
                            </p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {formatCurrency(shift.opening_balance)}
                            </p>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="mb-6 border-l-4 border-l-yellow-500 bg-yellow-50 p-6 dark:bg-yellow-950">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                                Tidak Ada Shift Aktif
                            </h3>
                            <p className="mt-1 text-yellow-700 dark:text-yellow-300">
                                Buka shift baru untuk memulai transaksi
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Today Stats */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Transaksi Hari Ini
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {formatNumber(todaySales.transactionCount)}
                            </p>
                        </div>
                        <ShoppingCart className="size-8 text-brand-500" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Penjualan
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {formatCurrency(todaySales.totalAmount)}
                            </p>
                        </div>
                        <TrendingUp className="size-8 text-green-500" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Diskon
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {formatCurrency(todaySales.totalDiscount)}
                            </p>
                        </div>
                        <RotateCw className="size-8 text-orange-500" />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Rata-rata
                            </p>
                            <p className="mt-1 text-2xl font-bold">
                                {formatCurrency(todaySales.averageTransaction)}
                            </p>
                        </div>
                        <BarChart3 className="size-8 text-purple-500" />
                    </div>
                </Card>
            </div>

            {/* Top Products */}
            <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold">
                    Produk Terlaris Hari Ini
                </h3>
                {topProducts.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                        Belum ada penjualan hari ini
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">
                                        Produk
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium">
                                        Terjual
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {topProducts.map((product, idx) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-muted/50"
                                    >
                                        <td className="px-4 py-3">
                                            {idx + 1}. {product.name}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatNumber(
                                                product.quantity_sold,
                                            )}{' '}
                                            pcs
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold">
                                            {formatCurrency(
                                                product.total_sales,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </>
    );
}

CashierDashboard.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default CashierDashboard;
