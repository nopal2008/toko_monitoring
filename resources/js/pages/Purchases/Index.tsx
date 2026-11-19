import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import PurchaseController from '@/actions/App/Http/Controllers/PurchaseController';
import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency, formatDateOnly } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Paginated, Purchase } from '@/types/models';

function PurchaseStatusBadge({ status }: { status: Purchase['status'] }) {
    const config = {
        draft: {
            label: 'Draf',
            className: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        completed: {
            label: 'Selesai',
            className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
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

function PurchasesIndex({ purchases }: { purchases: Paginated<Purchase> }) {
    const { can } = useAuth();
    const canManage = can('purchase.manage');

    function receive(purchase: Purchase) {
        router.post(PurchaseController.receive.url(purchase.id), {}, {
            onSuccess: () => router.reload(),
        });
    }

    function destroy(purchase: Purchase) {
        if (!window.confirm(`Batalkan pembelian ${purchase.invoice_number}?`)) {
            return;
        }

        router.delete(PurchaseController.destroy.url(purchase.id), {
            onSuccess: () => router.reload(),
        });
    }

    return (
        <>
            <Head title="Pembelian" />
            <PageHeader
                title="Pembelian"
                description="Catat pesanan pembelian supplier dan terima stok ke gudang."
                actions={
                    canManage ? (
                        <Link
                            href={PurchaseController.create.url()}
                            className={buttonClass('primary')}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Pembelian Baru</span>
                        </Link>
                    ) : undefined
                }
            />
            <Card>
                {purchases.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada pembelian"
                        description="Catat pesanan pembelian pertama untuk supplier."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[48rem] text-sm">
                            <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        No. Invoice
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Supplier
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Toko
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Tanggal
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right font-medium">
                                        Total
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th scope="col" className="px-4 py-3 text-right font-medium">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {purchases.data.map((purchase) => (
                                    <tr
                                        key={purchase.id}
                                        className="transition-colors hover:bg-muted/40"
                                    >
                                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                                            {purchase.invoice_number}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {purchase.supplier?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {purchase.store?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                            {formatDateOnly(purchase.purchase_date)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                                            {formatCurrency(purchase.total_amount)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <PurchaseStatusBadge status={purchase.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={PurchaseController.show.url(purchase.id)}
                                                    className={buttonClass('secondary', 'h-8 px-2.5 text-xs')}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>Detail</span>
                                                </Link>
                                                {purchase.status === 'draft' && canManage ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => receive(purchase)}
                                                        className={buttonClass('primary', 'h-8 px-2.5 text-xs')}
                                                    >
                                                        Terima
                                                    </button>
                                                ) : null}
                                                {purchase.status === 'draft' && canManage ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => destroy(purchase)}
                                                        className={buttonClass('danger', 'h-8 px-2.5 text-xs')}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span>Batalkan</span>
                                                    </button>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination
                    links={purchases.links}
                    from={purchases.from}
                    to={purchases.to}
                    total={purchases.total}
                />
            </Card>
        </>
    );
}

PurchasesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default PurchasesIndex;
