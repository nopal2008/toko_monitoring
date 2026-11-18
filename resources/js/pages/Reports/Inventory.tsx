import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Card, EmptyState, PageHeader } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import { ReportTabs } from '@/components/report-tabs';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/format';
import { inventory as reportsInventory } from '@/routes/reports';
import type { Paginated } from '@/types/models';

type InventoryReportRow = {
    id: number;
    store_id: number;
    product_id: number;
    quantity: number;
    min_stock: number;
    store: { id: number; name: string } | null;
    product: { id: number; name: string; sku: string; unit: string } | null;
};

type Props = {
    report: Paginated<InventoryReportRow>;
    filters: {
        store_id?: number;
        low_stock?: boolean;
    };
};

function ReportsInventory({ report, filters }: Props) {
    const [lowStock, setLowStock] = useState(Boolean(filters.low_stock));

    function toggleLowStock(checked: boolean) {
        setLowStock(checked);
        router.get(
            reportsInventory.url(),
            checked ? { low_stock: 1 } : {},
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Laporan Inventori" />
            <PageHeader
                title="Laporan Inventori Stok"
                description="Status ketersediaan stok produk dan analisis per cabang."
                actions={
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                        <input
                            type="checkbox"
                            checked={lowStock}
                            onChange={(e) => toggleLowStock(e.target.checked)}
                            className="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                        />
                        <span>Hanya Stok Menipis</span>
                    </label>
                }
            />

            <ReportTabs current="inventory" filters={{ low_stock: lowStock ? 1 : undefined }} />

            <Card>
                {report.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada data stok"
                        description="Belum ada data stok produk yang tercatat pada kriteria ini."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[36rem] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                                <tr>
                                    <th scope="col" className="px-5 py-3">Cabang Toko</th>
                                    <th scope="col" className="px-5 py-3">SKU</th>
                                    <th scope="col" className="px-5 py-3">Nama Produk</th>
                                    <th scope="col" className="px-5 py-3 text-right">Kuantitas</th>
                                    <th scope="col" className="px-5 py-3 text-right">Batas Minimum</th>
                                    <th scope="col" className="px-5 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {report.data.map((row) => (
                                    <tr key={row.id} className="transition hover:bg-slate-50/50">
                                        <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                            {row.store?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                                            {row.product?.sku ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                            {row.product?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                                            {formatNumber(row.quantity)}{' '}
                                            <span className="text-xs font-normal text-slate-500">
                                                {row.product?.unit ?? 'pcs'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-slate-600 whitespace-nowrap">
                                            {formatNumber(row.min_stock)}{' '}
                                            <span className="text-xs text-slate-400">
                                                {row.product?.unit ?? 'pcs'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                            {row.quantity <= row.min_stock ? (
                                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800">
                                                    Perlu Restock
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                                    Cukup
                                                </span>
                                            )}
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

ReportsInventory.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ReportsInventory;
