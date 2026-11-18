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
import { Archive, ArchiveRestore } from 'lucide-react';

function BrandsIndex({
    brands,
    showingArchived = false,
}: {
    brands: Paginated<Brand>;
    showingArchived?: boolean;
}) {
    const { can } = useAuth();
    const canManage = can('brand.manage');

    const handleRestore = (brandId: number) => {
        if (confirm('Pulihkan merek ini dari arsip?')) {
            router.post(BrandController.restore.url(brandId), {}, {
                preserveScroll: true,
            });
        }
    };

    const toggleArchiveView = () => {
        router.get(
            BrandController.index.url(),
            showingArchived ? {} : { archived: '1' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const createLink = canManage ? (
        <Link href={BrandController.create.url()} className={buttonClass('primary')}>
            Tambah merek
        </Link>
    ) : undefined;

    return (
        <>
            <Head title="Merek" />
            <PageHeader
                title="Merek"
                description="Kategori merek produk."
                actions={
                    <div className="flex gap-2">
                        {canManage && (
                            <button onClick={toggleArchiveView} className={buttonClass('secondary')}>
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
                        <Archive className="inline-block h-4 w-4 mr-2" />
                        Menampilkan merek yang diarsipkan
                    </div>
                )}
                {brands.data.length === 0 ? (
                    <EmptyState
                        title={showingArchived ? 'Belum ada merek diarsipkan' : 'Belum ada merek'}
                        description={
                            showingArchived
                                ? 'Merek yang diarsipkan akan muncul di sini.'
                                : canManage
                                  ? 'Tambahkan merek produk.'
                                  : 'Merek akan tampil di sini setelah dibuat oleh pengelola.'
                        }
                        action={!showingArchived ? createLink : undefined}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[36rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-medium">Merek</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Slug</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Produk</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {brands.data.map((brand) => (
                                        <tr key={brand.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <Link href={BrandController.show.url(brand.id)} className="font-medium text-brand-700 hover:underline dark:text-brand-300">
                                                    {brand.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">{brand.slug}</td>
                                            <td className="px-4 py-3 text-right">{formatNumber(brand.products_count ?? 0)}</td>
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                        Diarsipkan
                                                    </span>
                                                ) : (
                                                    <StatusBadge active={brand.is_active} />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {canManage && showingArchived ? (
                                                        <button onClick={() => handleRestore(brand.id)} className={buttonClass('secondary')}>
                                                            <ArchiveRestore className="h-4 w-4" />
                                                            Pulihkan
                                                        </button>
                                                    ) : canManage ? (
                                                        <>
                                                            <Link href={BrandController.edit.url(brand.id)} className={buttonClass('secondary')}>
                                                                Ubah
                                                            </Link>
                                                            <DeleteAction url={BrandController.destroy.url(brand.id)} itemName={brand.name} />
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
