import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
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
import { formatNumber } from '@/lib/format';
import type { Category, Paginated } from '@/types/models';

function CategoriesIndex({ categories }: { categories: Paginated<Category> }) {
    const { can } = useAuth();
    const canManage = can('product.manage');

    const createLink = canManage ? (
        <Link
            href={CategoryController.create.url()}
            className={buttonClass('primary')}
        >
            Tambah kategori
        </Link>
    ) : undefined;

    return (
        <>
            <Head title="Kategori" />
            <PageHeader
                title="Kategori"
                description="Kelompokkan produk berdasarkan kategori."
                actions={createLink}
            />
            <Card>
                {categories.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada kategori"
                        description={
                            canManage
                                ? 'Tambahkan kategori untuk mengelompokkan produk.'
                                : 'Kategori akan tampil di sini setelah dibuat oleh pengelola.'
                        }
                        action={createLink}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[32rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-medium">Nama</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Produk</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {categories.data.map((category) => (
                                        <tr key={category.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={CategoryController.show.url(category.id)}
                                                    className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                >
                                                    {category.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatNumber(category.products_count ?? 0)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge active={category.is_active} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {canManage && (
                                                        <>
                                                            <Link
                                                                href={CategoryController.edit.url(category.id)}
                                                                className={buttonClass('secondary')}
                                                            >
                                                                Ubah
                                                            </Link>
                                                            <DeleteAction
                                                                url={CategoryController.destroy.url(category.id)}
                                                                itemName={category.name}
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
                            links={categories.links}
                            from={categories.from}
                            to={categories.to}
                            total={categories.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

CategoriesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default CategoriesIndex;
