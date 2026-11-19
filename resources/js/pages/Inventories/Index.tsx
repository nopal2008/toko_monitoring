import { Head, router, useForm } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    SlidersHorizontal,
    Warehouse,
    XCircle,
} from 'lucide-react';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/format';
import {
    adjust as inventoriesAdjust,
    index as inventoriesIndex,
} from '@/routes/inventories';
import type { Paginated } from '@/types/models';

type InventoryRow = {
    id: number;
    store_id: number;
    product_id: number;
    quantity: number;
    min_stock: number;
    store: { id: number; name: string } | null;
    product: { id: number; name: string; sku: string; unit: string } | null;
};

type Props = {
    inventories: Paginated<InventoryRow>;
};

function StockStatusBadge({
    quantity,
    minStock,
}: {
    quantity: number;
    minStock: number;
}) {
    if (quantity <= 0) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
                <XCircle className="h-3 w-3" />
                <span>Habis</span>
            </span>
        );
    }
    if (quantity <= minStock) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                <AlertTriangle className="h-3 w-3" />
                <span>Menipis</span>
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-3 w-3" />
            <span>Aman</span>
        </span>
    );
}

function InventoriesIndex({ inventories }: Props) {
    const { can } = useAuth();
    const urlParams = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );
    const [lowStockFilter, setLowStockFilter] = useState(
        urlParams.get('low_stock') === '1',
    );

    // State modal adjust
    const [selectedItem, setSelectedItem] = useState<InventoryRow | null>(null);
    const adjustForm = useForm({
        store_id: 0,
        product_id: 0,
        quantity_change: 0,
        reason: '',
    });

    function toggleLowStock(checked: boolean) {
        setLowStockFilter(checked);
        router.get(inventoriesIndex.url(), checked ? { low_stock: 1 } : {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    function openAdjustModal(item: InventoryRow) {
        setSelectedItem(item);
        adjustForm.setData({
            store_id: item.store_id,
            product_id: item.product_id,
            quantity_change: 0,
            reason: '',
        });
        adjustForm.clearErrors();
    }

    function submitAdjust(e: React.FormEvent) {
        e.preventDefault();
        adjustForm.post(inventoriesAdjust.url(), {
            onSuccess: () => {
                setSelectedItem(null);
                adjustForm.reset();
            },
        });
    }

    return (
        <>
            <Head title="Inventori" />
            <PageHeader
                title="Inventori Stok"
                description="Pantau kuantitas stok produk di setiap cabang toko."
                actions={
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                        <input
                            type="checkbox"
                            checked={lowStockFilter}
                            onChange={(e) => toggleLowStock(e.target.checked)}
                            className="size-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                        />
                        <span>Hanya Stok Menipis</span>
                    </label>
                }
            />

            {/* Adjust Modal */}
            {selectedItem && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="adjust-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                >
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2
                            id="adjust-title"
                            className="text-lg font-semibold text-slate-900"
                        >
                            Sesuaikan Stok
                        </h2>
                        <div className="mt-2 rounded-md bg-slate-50 p-3 text-sm">
                            <p className="font-medium text-slate-900">
                                {selectedItem.product?.name} (
                                {selectedItem.product?.sku})
                            </p>
                            <p className="text-slate-600">
                                Toko: {selectedItem.store?.name} &bull; Stok
                                saat ini:{' '}
                                <strong className="text-slate-900">
                                    {selectedItem.quantity}{' '}
                                    {selectedItem.product?.unit}
                                </strong>
                            </p>
                        </div>

                        <form
                            onSubmit={submitAdjust}
                            className="mt-4 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="quantity_change"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Perubahan Jumlah (+ / -){' '}
                                    <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="quantity_change"
                                    required
                                    value={adjustForm.data.quantity_change}
                                    onChange={(e) =>
                                        adjustForm.setData(
                                            'quantity_change',
                                            Number(e.target.value),
                                        )
                                    }
                                    placeholder="Contoh: 10 untuk menambah, -5 untuk mengurangi"
                                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Gunakan angka positif untuk menambah stok,
                                    angka negatif untuk mengurangi.
                                </p>
                                {adjustForm.errors.quantity_change && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {adjustForm.errors.quantity_change}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="adjust_reason"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Alasan Penyesuaian{' '}
                                    <span className="text-rose-600">*</span>
                                </label>
                                <textarea
                                    id="adjust_reason"
                                    required
                                    rows={3}
                                    value={adjustForm.data.reason}
                                    onChange={(e) =>
                                        adjustForm.setData(
                                            'reason',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Stock opname bulanan / barang rusak saat pengiriman"
                                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                />
                                {adjustForm.errors.reason && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {adjustForm.errors.reason}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedItem(null)}
                                    disabled={adjustForm.processing}
                                    className={buttonClass('secondary')}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={adjustForm.processing}
                                    className={buttonClass('primary')}
                                >
                                    {adjustForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Card>
                {inventories.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada data inventori"
                        description={
                            lowStockFilter
                                ? 'Tidak ada produk dengan stok di bawah atau sama dengan batas minimum.'
                                : 'Data stok akan otomatis dibuat saat produk dihubungkan dengan cabang toko.'
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[48rem] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium tracking-wider text-slate-600 uppercase">
                                <tr>
                                    <th scope="col" className="px-5 py-3">
                                        Produk
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        SKU
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Toko
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right"
                                    >
                                        Stok
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right"
                                    >
                                        Min. Stok
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-center"
                                    >
                                        Status
                                    </th>
                                    {can('inventory.adjust') && (
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-right"
                                        >
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {inventories.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="transition hover:bg-slate-50/50"
                                    >
                                        <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <Warehouse className="h-4 w-4 text-slate-400" />
                                                <span>
                                                    {item.product?.name ?? '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs whitespace-nowrap text-slate-600">
                                            {item.product?.sku ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                                            {item.store?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold whitespace-nowrap text-slate-900">
                                            {formatNumber(item.quantity)}{' '}
                                            <span className="text-xs font-normal text-slate-500">
                                                {item.product?.unit ?? 'pcs'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap text-slate-600">
                                            {formatNumber(item.min_stock)}{' '}
                                            <span className="text-xs text-slate-400">
                                                {item.product?.unit ?? 'pcs'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                            <StockStatusBadge
                                                quantity={item.quantity}
                                                minStock={item.min_stock}
                                            />
                                        </td>
                                        {can('inventory.adjust') && (
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openAdjustModal(item)
                                                    }
                                                    className={buttonClass(
                                                        'secondary',
                                                        'h-8 px-2.5 text-xs',
                                                    )}
                                                >
                                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                                    <span>Sesuaikan</span>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination
                    links={inventories.links}
                    from={inventories.from}
                    to={inventories.to}
                    total={inventories.total}
                />
            </Card>
        </>
    );
}

InventoriesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default InventoriesIndex;
