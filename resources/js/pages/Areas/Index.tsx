import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AreaController from '@/actions/App/Http/Controllers/AreaController';
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
import type { Area, Paginated } from '@/types/models';
import { Archive, ArchiveRestore } from 'lucide-react';

function AreasIndex({
    areas,
    showingArchived = false,
}: {
    areas: Paginated<Area>;
    showingArchived?: boolean;
}) {
    const { can } = useAuth();
    const canManage = can('area.manage');

    const handleRestore = (areaId: number) => {
        if (confirm('Pulihkan area ini dari arsip?')) {
            router.post(AreaController.restore.url(areaId), {}, {
                preserveScroll: true,
            });
        }
    };

    const toggleArchiveView = () => {
        router.get(
            AreaController.index.url(),
            showingArchived ? {} : { archived: '1' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const createLink = canManage ? (
        <Link href={AreaController.create.url()} className={buttonClass('primary')}>
            Tambah area
        </Link>
    ) : undefined;

    return (
        <>
            <Head title="Area" />
            <PageHeader
                title="Area"
                description="Kelompok wilayah operasional toko."
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
                        Menampilkan area yang diarsipkan
                    </div>
                )}
                {areas.data.length === 0 ? (
                    <EmptyState
                        title={showingArchived ? 'Belum ada area diarsipkan' : 'Belum ada area'}
                        description={
                            showingArchived
                                ? 'Area yang diarsipkan akan muncul di sini.'
                                : canManage
                                  ? 'Tambahkan area untuk memisahkan wilayah operasional.'
                                  : 'Area akan tampil di sini setelah dibuat oleh pengelola.'
                        }
                        action={!showingArchived ? createLink : undefined}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[40rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-medium">Area</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Kode</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Cabang</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {areas.data.map((area) => (
                                        <tr key={area.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <Link href={AreaController.show.url(area.id)} className="font-medium text-brand-700 hover:underline dark:text-brand-300">
                                                    {area.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">{area.code}</td>
                                            <td className="px-4 py-3 text-right">{formatNumber(area.stores_count ?? 0)}</td>
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                        Diarsipkan
                                                    </span>
                                                ) : (
                                                    <StatusBadge active={area.is_active} />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {canManage && showingArchived ? (
                                                        <button onClick={() => handleRestore(area.id)} className={buttonClass('secondary')}>
                                                            <ArchiveRestore className="h-4 w-4" />
                                                            Pulihkan
                                                        </button>
                                                    ) : canManage ? (
                                                        <>
                                                            <Link href={AreaController.edit.url(area.id)} className={buttonClass('secondary')}>
                                                                Ubah
                                                            </Link>
                                                            <DeleteAction url={AreaController.destroy.url(area.id)} itemName={area.name} />
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
                            links={areas.links}
                            from={areas.from}
                            to={areas.to}
                            total={areas.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

AreasIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default AreasIndex;
