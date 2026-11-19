import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import PromotionController from '@/actions/App/Http/Controllers/PromotionController';
import { DeleteAction } from '@/components/delete-action';
import { Pagination } from '@/components/pagination';
import {
    buttonClass,
    Card,
    EmptyState,
    PageHeader,
    StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateOnly } from '@/lib/format';
import type { Paginated, Promotion } from '@/types/models';

const TYPE_LABELS: Record<Promotion['type'], string> = {
    percent: 'Diskon %',
    fixed: 'Potongan nominal',
    bogo: 'Beli X gratis Y',
};

function promotionValue(promotion: Promotion): string {
    if (promotion.type === 'percent') {
        return `${Number(promotion.value)}%`;
    }

    if (promotion.type === 'fixed') {
        return formatCurrency(promotion.value);
    }

    return `Beli ${promotion.buy_quantity ?? 0} gratis ${promotion.free_quantity ?? 0}`;
}

function PromotionsIndex({
    promotions,
}: {
    promotions: Paginated<Promotion>;
}) {
    const { can } = useAuth();
    const canManage = can('product.manage');

    const createLink = canManage ? (
        <Link
            href={PromotionController.create.url()}
            className={buttonClass('primary')}
        >
            Tambah promosi
        </Link>
    ) : undefined;

    return (
        <>
            <Head title="Promosi" />
            <PageHeader
                title="Promosi"
                description="Atur diskon otomatis, potongan nominal, dan promo beli X gratis Y."
                actions={createLink}
            />
            <Card>
                {promotions.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada promosi"
                        description="Promosi aktif akan otomatis diterapkan pada transaksi kasir."
                        action={createLink}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[44rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-medium">
                                            Nama
                                        </th>
                                        <th scope="col" className="px-4 py-3 font-medium">
                                            Jenis
                                        </th>
                                        <th scope="col" className="px-4 py-3 font-medium">
                                            Cakupan
                                        </th>
                                        <th scope="col" className="px-4 py-3 font-medium">
                                            Periode
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
                                    {promotions.data.map((promotion) => (
                                        <tr
                                            key={promotion.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-foreground">
                                                    {promotion.name}
                                                </p>
                                                {promotion.product && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {promotion.product.name}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p>{TYPE_LABELS[promotion.type]}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {promotionValue(promotion)}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                {promotion.store?.name ??
                                                    'Semua cabang'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {promotion.starts_at
                                                    ? formatDateOnly(
                                                          promotion.starts_at,
                                                      )
                                                    : 'Kapan saja'}
                                                {' - '}
                                                {promotion.ends_at
                                                    ? formatDateOnly(
                                                          promotion.ends_at,
                                                      )
                                                    : 'Tanpa batas'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge
                                                    active={promotion.is_active}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {canManage && (
                                                        <>
                                                            <Link
                                                                href={PromotionController.edit.url(
                                                                    promotion.id,
                                                                )}
                                                                className={buttonClass(
                                                                    'secondary',
                                                                )}
                                                            >
                                                                Ubah
                                                            </Link>
                                                            <DeleteAction
                                                                url={PromotionController.destroy.url(
                                                                    promotion.id,
                                                                )}
                                                                itemName={
                                                                    promotion.name
                                                                }
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={promotions.links}
                            from={promotions.from}
                            to={promotions.to}
                            total={promotions.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

PromotionsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default PromotionsIndex;
