import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Card, DescriptionList, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import PurchaseController from '@/actions/App/Http/Controllers/PurchaseController';
import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { Purchase } from '@/types/models';

function PurchasesShow({ purchase }: { purchase: Purchase }) {
    const { can } = useAuth();
    const canManage = can('purchase.manage');

    function receive() {
        router.post(PurchaseController.receive.url(purchase.id), {}, {
            onSuccess: () => router.reload(),
        });
    }

    function destroy() {
        if (!window.confirm(`Batalkan pembelian ${purchase.invoice_number}?`)) {
            return;
        }

        router.delete(PurchaseController.destroy.url(purchase.id), {
            onSuccess: () => router.visit(PurchaseController.index.url()),
        });
    }

    return (
        <>
            <Head title={`Pembelian ${purchase.invoice_number}`} />
            <PageHeader
                title={`Pembelian ${purchase.invoice_number}`}
                description="Detail pesanan pembelian supplier."
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={PurchaseController.index.url()}
                            className={buttonClass('secondary')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Kembali</span>
                        </Link>
                        {purchase.status === 'draft' && canManage ? (
                            <button
                                type="button"
                                onClick={receive}
                                className={buttonClass('primary')}
                            >
                                Terima & Selesaikan
                            </button>
                        ) : null}
                        {purchase.status === 'draft' && canManage ? (
                            <button
                                type="button"
                                onClick={destroy}
                                className={buttonClass('danger')}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Batalkan</span>
                            </button>
                        ) : null}
                    </div>
                }
            />
            <Card className="mb-6 p-6">
                {purchase.items && purchase.items.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[40rem] text-sm">
                            <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Produk
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Kuantitas
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Harga Satuan
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {purchase.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 font-medium">
                                            {item.product?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3">{item.quantity}</td>
                                        <td className="px-4 py-3">
                                            {formatCurrency(item.unit_cost)}
                                        </td>
                                        <td className="px-4 py-3 font-semibold">
                                            {formatCurrency(item.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        title="Belum ada item pembelian"
                        description="Pesanan ini belum berisi item produk."
                    />
                )}
            </Card>

            <Card className="p-6">
                <DescriptionList
                    items={[
                        { label: 'No. Invoice', value: purchase.invoice_number },
                        { label: 'Toko', value: purchase.store?.name ?? '-' },
                        { label: 'Supplier', value: purchase.supplier?.name ?? '-' },
                        { label: 'Tanggal Pembelian', value: formatDateTime(purchase.purchase_date) },
                        { label: 'Status', value: purchase.status === 'draft' ? 'Draf' : 'Selesai' },
                        { label: 'Total', value: formatCurrency(purchase.total_amount) },
                        { label: 'Diterima Pada', value: purchase.received_at ? formatDateTime(purchase.received_at) : '-' },
                        { label: 'Dibuat', value: purchase.created_at ? formatDateTime(purchase.created_at) : '-' },
                        { label: 'Terbuat Oleh', value: purchase.createdBy?.name ?? '-' },
                        { label: 'Catatan', value: purchase.notes ?? '-' },
                    ]}
                />
            </Card>
        </>
    );
}

PurchasesShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default PurchasesShow;
