import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import { DeleteAction } from '@/components/delete-action';
import {
    buttonClass,
    Card,
    DescriptionList,
    EmptyState,
    PageHeader,
    StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format';
import type { Product } from '@/types/models';

function ProductsShow({ product }: { product: Product }) {
    const { can } = useAuth();
    const stores = product.stores ?? [];

    return (
        <>
            <Head title={product.name} />
            <PageHeader
                title={product.name}
                description={`SKU ${product.sku}`}
                actions={
                    <>
                        <Link
                            href={ProductController.index.url()}
                            className={buttonClass('secondary')}
                        >
                            Kembali
                        </Link>
                        {can('product.manage') && (
                            <>
                                <Link
                                    href={ProductController.edit.url(
                                        product.id,
                                    )}
                                    className={buttonClass('primary')}
                                >
                                    Ubah
                                </Link>
                                <DeleteAction
                                    url={ProductController.destroy.url(
                                        product.id,
                                    )}
                                    itemName={product.name}
                                    redirectOnSuccess
                                />
                            </>
                        )}
                    </>
                }
            />
            <Card className="p-6">
                <DescriptionList
                    items={[
                        {
                            label: 'Status',
                            value: <StatusBadge active={product.is_active} />,
                        },
                        { label: 'Kategori', value: product.category?.name },
                        { label: 'Barcode', value: product.barcode },
                        { label: 'Satuan', value: product.unit },
                        {
                            label: 'Harga jual',
                            value: formatCurrency(product.base_price),
                        },
                        {
                            label: 'Harga modal',
                            value: formatCurrency(product.cost_price),
                        },
                        { label: 'Deskripsi', value: product.description },
                        {
                            label: 'Dibuat',
                            value: formatDateTime(product.created_at),
                        },
                        {
                            label: 'Diperbarui',
                            value: formatDateTime(product.updated_at),
                        },
                    ]}
                />
            </Card>

            <Card className="mt-6">
                <div className="border-b border-border px-6 py-4">
                    <h2 className="text-base font-semibold text-foreground">
                        Tersedia di cabang
                    </h2>
                </div>
                {stores.length === 0 ? (
                    <EmptyState
                        title="Belum ditautkan ke cabang"
                        description="Produk ini belum memiliki pengaturan harga atau stok minimum per cabang."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[32rem] text-sm">
                            <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 font-medium"
                                    >
                                        Cabang
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right font-medium"
                                    >
                                        Harga cabang
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right font-medium"
                                    >
                                        Stok minimum
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 font-medium"
                                    >
                                        Ketersediaan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stores.map((store) => (
                                    <tr
                                        key={store.id}
                                        className="transition-colors hover:bg-muted/40"
                                    >
                                        <td className="px-6 py-3">
                                            {store.name}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono whitespace-nowrap tabular-nums">
                                            {store.pivot.price === null
                                                ? 'Harga dasar'
                                                : formatCurrency(
                                                      store.pivot.price,
                                                  )}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {store.pivot.min_stock === null
                                                ? '-'
                                                : formatNumber(
                                                      store.pivot.min_stock,
                                                  )}
                                        </td>
                                        <td className="px-6 py-3">
                                            <StatusBadge
                                                active={Boolean(
                                                    store.pivot.is_available,
                                                )}
                                                activeLabel="Tersedia"
                                                inactiveLabel="Tidak tersedia"
                                            />
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

ProductsShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ProductsShow;
