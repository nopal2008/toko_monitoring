import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import UnitController from '@/actions/App/Http/Controllers/UnitController';
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
import type { Paginated, Unit } from '@/types/models';
import { Archive, ArchiveRestore } from 'lucide-react';

function UnitsIndex({
    units,
    showingArchived = false,
}: {
    units: Paginated<Unit>;
    showingArchived?: boolean;
}) {
    const { can } = useAuth();
    const canManage = can('unit.manage');

    const handleRestore = (unitId: number) => {
        if (confirm('Pulihkan satuan ini dari arsip?')) {
            router.post(UnitController.restore.url(unitId), {}, {
                preserveScroll: true,
            });
        }
    };

    const toggleArchiveView = () => {
        router.get(
            UnitController.index.url(),
            showingArchived ? {} : { archived: '1' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const createLink = canManage ? (
        <Link href={UnitController.create.url()} className={buttonClass('primary')}>
            Tambah satuan
        </Link>
    ) : undefined;

    return (
        <>
            <Head title="Satuan" />
            <PageHeader
                title="Satuan"
                description="Satuan ukuran produk."
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
                        Menampilkan satuan yang diarsipkan
                    </div>
                )}
                {units.data.length === 0 ? (
                    <EmptyState
                        title={showingArchived ? 'Belum ada satuan diarsipkan' : 'Belum ada satuan'}
                        description={
                            showingArchived
                                ? 'Satuan yang diarsipkan akan muncul di sini.'
                                : canManage
                                  ? 'Tambahkan satuan ukuran produk.'
                                  : 'Satuan akan tampil di sini setelah dibuat oleh pengelola.'
                        }
                        action={!showingArchived ? createLink : undefined}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[32rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-medium">Satuan</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Simbol</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Produk</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {units.data.map((unit) => (
                                        <tr key={unit.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <Link href={UnitController.show.url(unit.id)} className="font-medium text-brand-700 hover:underline dark:text-brand-300">
                                                    {unit.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">{unit.symbol}</td>
                                            <td className="px-4 py-3 text-right">{formatNumber(unit.products_count ?? 0)}</td>
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                        Diarsipkan
                                                    </span>
                                                ) : (
                                                    <StatusBadge active={unit.is_active} />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {canManage && showingArchived ? (
                                                        <button onClick={() => handleRestore(unit.id)} className={buttonClass('secondary')}>
                                                            <ArchiveRestore className="h-4 w-4" />
                                                            Pulihkan
                                                        </button>
                                                    ) : canManage ? (
                                                        <>
                                                            <Link href={UnitController.edit.url(unit.id)} className={buttonClass('secondary')}>
                                                                Ubah
                                                            </Link>
                                                            <DeleteAction url={UnitController.destroy.url(unit.id)} itemName={unit.name} />
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
                            links={units.links}
                            from={units.from}
                            to={units.to}
                            total={units.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

UnitsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default UnitsIndex;
