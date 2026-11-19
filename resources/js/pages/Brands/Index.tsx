import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import BrandController from '@/actions/App/Http/Controllers/BrandController';
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
import type { Brand, Paginated } from '@/types/models';

function BrandsIndex({
    brands,
    showingArchived,
}: {
    brands: Paginated<Brand>;
    showingArchived: boolean;
}) {
    const { can } = useAuth();
    const canManage = can('brand.manage');

    const createLink = canManage ? (
        <Link
            href={BrandController.create.url()}
            className={buttonClass('primary')}
        >
            Tambah merek
        </Link>
    ) : undefined;

    const toggleArchiveView = () => {
        router.get(
            BrandController.index.url(),
            { archived: showingArchived ? '0' : '1' },
            { preserveState: true, preserveScroll: true },
        );
    };

    const restoreBrand = (id: number, name: string) => {
        if (
            confirm(
                `Apakah Anda yakin ingin memulihkan merek "${name}" dari arsip?`,
            )
        ) {
            router.post(BrandController.restore.url(id));
        }
    };

    return (
        <>
            <Head title="Merek" />
            <PageHeader
                title="Merek"
                description="Kelola merek produk untuk memudahkan identifikasi."
                actions={
                    <div className="flex gap-2">
                        {canManage && (
                            <button
                                type="button"
                                onClick={toggleArchiveView}
                                className={buttonClass('secondary')}
                            >
                                {showingArchived
                                    ? 'Lihat Aktif'
                                    : 'Lihat Arsip'}
                            </button>
                        )}
                        {createLink}
                    </div>
                }
            />
            <Card>
                {brands.data.length === 0 ? (
                    <EmptyState
                        title={
                            showingArchived
                                ? 'Belum ada merek diarsipkan'
                                : 'Belum ada merek'
                        }
                        description={
                            showingArchived
                                ? 'Merek yang diarsipkan akan tampil di sini.'
                                : canManage
                                  ? 'Tambahkan merek untuk memudahkan identifikasi produk.'
                                  : 'Merek akan tampil di sini setelah dibuat oleh pengelola.'
                        }
                        action={showingArchived ? undefined : createLink}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[32rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-medium"
                                        >
                                            Nama
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-right font-medium"
                                        >
                                            Produk
                                        </th>
                                        {!showingArchived && (
                                            <th
                                                scope="col"
                                                className="px-4 py-3 font-medium"
                                            >
                                                Status
                                            </th>
                                        )}
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-right font-medium"
                                        >
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {brands.data.map((brand) => (
                                        <tr
                                            key={brand.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <span className="font-medium text-muted-foreground">
                                                        {brand.name}
                                                    </span>
                                                ) : (
                                                    <Link
                                                        href={BrandController.show.url(
                                                            brand.id,
                                                        )}
                                                        className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                    >
                                                        {brand.name}
                                                    </Link>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatNumber(
                                                    brand.products_count ?? 0,
                                                )}
                                            </td>
                                            {!showingArchived && (
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        active={brand.is_active}
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {canManage &&
                                                        (showingArchived ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    restoreBrand(
                                                                        brand.id,
                                                                        brand.name,
                                                                    )
                                                                }
                                                                className={buttonClass(
                                                                    'primary',
                                                                )}
                                                            >
                                                                Pulihkan
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <Link
                                                                    href={BrandController.edit.url(
                                                                        brand.id,
                                                                    )}
                                                                    className={buttonClass(
                                                                        'secondary',
                                                                    )}
                                                                >
                                                                    Ubah
                                                                </Link>
                                                                <DeleteAction
                                                                    url={BrandController.destroy.url(
                                                                        brand.id,
                                                                    )}
                                                                    itemName={
                                                                        brand.name
                                                                    }
                                                                />
                                                            </>
                                                        ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={brands.links}
                            from={brands.from}
                            to={brands.to}
                            total={brands.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

BrandsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default BrandsIndex;
