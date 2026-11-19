import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
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
import { formatCurrency } from '@/lib/format';
import type { CategoryOption, Paginated, Product } from '@/types/models';
import { Archive, ArchiveRestore } from 'lucide-react';

function ProductsIndex({
    products,
    showingArchived = false,
}: {
    products: Paginated<Product>;
    categories: CategoryOption[];
    showingArchived?: boolean;
}) {
    const { can } = useAuth();
    const canManage = can('product.manage');

    const handleRestore = (productId: number) => {
        if (confirm('Pulihkan produk ini dari arsip?')) {
            router.post(
                ProductController.restore.url(productId),
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const toggleArchiveView = () => {
        router.get(
            ProductController.index.url(),
            showingArchived ? {} : { archived: '1' },
            { preserveState: true, preserveScroll: true },
        );
    };

    const createLink = canManage ? (
        <Link
            href={ProductController.create.url()}
            className={buttonClass('primary')}
        >
            Tambah produk
        </Link>
    ) : undefined;

    return (
        <>
            <Head title="Produk" />
            <PageHeader
                title="Produk"
                description="Katalog produk untuk semua cabang."
                actions={
                    <div className="flex gap-2">
                        {canManage && (
                            <button
                                onClick={toggleArchiveView}
                                className={buttonClass('secondary')}
                            >
                                {showingArchived ? (
                                    <>
                                        <ArchiveRestore className="h-4 w-4" />
                                        <span>Lihat Aktif</span>
                                    </>
                                ) : (
                                    <>
                                        <Archive className="h-4 w-4" />
                                        <span>Lihat Arsip</span>
                                    </>
                                )}
                            </button>
                        )}
                        {createLink}
                    </div>
                }
            />
            <Card>
                {showingArchived && (
                    <div className="border-b border-border bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <Archive className="mr-2 inline-block h-4 w-4" />
                        Menampilkan produk yang diarsipkan
                    </div>
                )}
                {products.data.length === 0 ? (
                    <EmptyState
                        title={
                            showingArchived
                                ? 'Belum ada produk diarsipkan'
                                : 'Belum ada produk'
                        }
                        description={
                            showingArchived
                                ? 'Produk yang diarsipkan akan muncul di sini.'
                                : canManage
                                  ? 'Tambahkan produk pertama ke katalog.'
                                  : 'Produk akan tampil di sini setelah dibuat oleh pengelola.'
                        }
                        action={!showingArchived ? createLink : undefined}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[52rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-medium"
                                        >
                                            Produk
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-medium"
                                        >
                                            Kategori
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-right font-medium"
                                        >
                                            Harga jual
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-right font-medium"
                                        >
                                            Harga modal
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-medium"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-right font-medium"
                                        >
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {products.data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <div>
                                                        <div className="font-medium text-muted-foreground">
                                                            {product.name}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            SKU {product.sku}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Link
                                                            href={ProductController.show.url(
                                                                product.id,
                                                            )}
                                                            className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground">
                                                            SKU {product.sku}
                                                        </p>
                                                    </>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {product.category?.name ?? '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono whitespace-nowrap tabular-nums">
                                                {formatCurrency(
                                                    product.base_price,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono whitespace-nowrap tabular-nums">
                                                {formatCurrency(
                                                    product.cost_price,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                        Diarsipkan
                                                    </span>
                                                ) : (
                                                    <StatusBadge
                                                        active={
                                                            product.is_active
                                                        }
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {canManage &&
                                                    showingArchived ? (
                                                        <button
                                                            onClick={() =>
                                                                handleRestore(
                                                                    product.id,
                                                                )
                                                            }
                                                            className={buttonClass(
                                                                'secondary',
                                                            )}
                                                        >
                                                            <ArchiveRestore className="h-4 w-4" />
                                                            Pulihkan
                                                        </button>
                                                    ) : canManage ? (
                                                        <>
                                                            <Link
                                                                href={ProductController.edit.url(
                                                                    product.id,
                                                                )}
                                                                className={buttonClass(
                                                                    'secondary',
                                                                )}
                                                            >
                                                                Ubah
                                                            </Link>
                                                            <DeleteAction
                                                                url={ProductController.destroy.url(
                                                                    product.id,
                                                                )}
                                                                itemName={
                                                                    product.name
                                                                }
                                                            />
                                                        </>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={products.links}
                            from={products.from}
                            to={products.to}
                            total={products.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

ProductsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ProductsIndex;
