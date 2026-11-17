import { Head, Link } from '@inertiajs/react';
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

// `categories` dikirim controller tetapi daftar produk belum punya parameter
// filter di backend, jadi tidak dipakai di sini.
function ProductsIndex({
    products,
}: {
    products: Paginated<Product>;
    categories: CategoryOption[];
}) {
    const { can } = useAuth();
    const canManage = can('product.manage');

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
                actions={createLink}
            />
            <Card>
                {products.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada produk"
                        description={
                            canManage
                                ? 'Tambahkan produk pertama ke katalog.'
                                : 'Produk akan tampil di sini setelah dibuat oleh pengelola.'
                        }
                        action={createLink}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[52rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-medium">Produk</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Kategori</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Harga jual</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Harga modal</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={ProductController.show.url(product.id)}
                                                    className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                >
                                                    {product.name}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">SKU {product.sku}</p>
                                            </td>
                                            <td className="px-4 py-3">{product.category?.name ?? '-'}</td>
                                            <td className="px-4 py-3 text-right font-mono whitespace-nowrap tabular-nums">
                                                {formatCurrency(product.base_price)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono whitespace-nowrap tabular-nums">
                                                {formatCurrency(product.cost_price)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge active={product.is_active} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {canManage && (
                                                        <>
                                                            <Link
                                                                href={ProductController.edit.url(product.id)}
                                                                className={buttonClass('secondary')}
                                                            >
                                                                Ubah
                                                            </Link>
                                                            <DeleteAction
                                                                url={ProductController.destroy.url(product.id)}
                                                                itemName={product.name}
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
