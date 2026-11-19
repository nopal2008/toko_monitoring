import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';
import StockOpnameController from '@/actions/App/Http/Controllers/StockOpnameController';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { StockOpname } from '@/types/models';

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    counting: 'Penghitungan',
    submitted: 'Diajukan',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    completed: 'Selesai',
};

function StockOpnamesShow({ opname }: { opname: StockOpname }) {
    const { can } = useAuth();
    const canPost =
        can('inventory.adjust') &&
        ['draft', 'counting', 'submitted'].includes(opname.status);

    function postOpname() {
        router.post(StockOpnameController.post.url(opname.id), undefined, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`Stock opname ${opname.reference}`} />
            <PageHeader
                title={`Stock opname ${opname.reference}`}
                description={`${opname.warehouse?.name ?? '-'} · ${STATUS_LABELS[opname.status] ?? opname.status}`}
                actions={
                    <div className="flex gap-2">
                        <Link
                            href={StockOpnameController.index.url()}
                            className={buttonClass('secondary')}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Link>
                        {canPost && (
                            <button
                                type="button"
                                onClick={postOpname}
                                className={buttonClass('primary')}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Posting & sesuaikan stok
                            </button>
                        )}
                    </div>
                }
            />

            <div className="mb-4 grid gap-4 md:grid-cols-2">
                <Card className="p-5">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                        Informasi
                    </h2>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Gudang</dt>
                            <dd className="font-medium">
                                {opname.warehouse?.name ?? '-'}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Petugas</dt>
                            <dd className="font-medium">
                                {opname.counter?.name ?? '-'}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">
                                Disetujui oleh
                            </dt>
                            <dd className="font-medium">
                                {opname.approver?.name ?? '-'}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Dibuat</dt>
                            <dd className="font-medium">
                                {formatDateTime(opname.created_at)}
                            </dd>
                        </div>
                    </dl>
                </Card>
                <Card className="p-5">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                        Catatan
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {opname.notes || 'Tidak ada catatan.'}
                    </p>
                </Card>
            </div>

            <Card>
                <div className="border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold text-foreground">
                        Item ({opname.items?.length ?? 0})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[40rem] text-sm">
                        <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                            <tr>
                                <th className="px-4 py-3 font-medium">
                                    Produk
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Sistem
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Fisik
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Selisih
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Catatan
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {(opname.items ?? []).map((item) => {
                                const difference = Number(item.difference);

                                return (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">
                                                {item.product?.name ??
                                                    `Produk #${item.product_id}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.product?.sku ?? '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatNumber(
                                                Number(item.system_quantity),
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatNumber(
                                                Number(item.physical_quantity),
                                            )}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-medium ${
                                                difference === 0
                                                    ? 'text-muted-foreground'
                                                    : difference > 0
                                                      ? 'text-emerald-600'
                                                      : 'text-danger-fg'
                                            }`}
                                        >
                                            {difference > 0 ? '+' : ''}
                                            {formatNumber(difference)}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            {item.notes || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    );
}

StockOpnamesShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default StockOpnamesShow;
