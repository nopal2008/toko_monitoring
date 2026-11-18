import { Head, Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import WarehouseController from '@/actions/App/Http/Controllers/WarehouseController';
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
import type { Paginated, Warehouse } from '@/types/models';
import { Archive, ArchiveRestore } from 'lucide-react';

function WarehousesIndex({
    warehouses,
    showingArchived = false,
}: {
    warehouses: Paginated<Warehouse>;
    showingArchived?: boolean;
}) {
    const { can } = useAuth();
    const canManage = can('warehouse.manage');

    const handleRestore = (warehouseId: number) => {
        if (confirm('Pulihkan gudang ini dari arsip?')) {
            router.post(WarehouseController.restore.url(warehouseId), {}, {
                preserveScroll: true,
            });
        }
    };

    const toggleArchiveView = () => {
        router.get(
            WarehouseController.index.url(),
            showingArchived ? {} : { archived: '1' },
            { preserveState: true, preserveScroll: true }
        );
    };

    const createLink = canManage ? (
        <Link href={WarehouseController.create.url()} className={buttonClass('primary')}>
            Tambah gudang
        </Link>
    ) : undefined;

    return (
        <>
            <Head title="Gudang" />
            <PageHeader
                title="Gudang"
                description="Lokasi penyimpanan persediaan barang."
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
                        Menampilkan gudang yang diarsipkan
                    </div>
                )}
                {warehouses.data.length === 0 ? (
                    <EmptyState
                        title={showingArchived ? 'Belum ada gudang diarsipkan' : 'Belum ada gudang'}
                        description={
                            showingArchived
                                ? 'Gudang yang diarsipkan akan muncul di sini.'
                                : canManage
                                  ? 'Tambahkan gudang pusat atau gudang cabang.'
                                  : 'Gudang akan tampil di sini setelah dibuat oleh pengelola.'
                        }
                        action={!showingArchived ? createLink : undefined}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[44rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-medium">Gudang</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Kode</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Tipe</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Cabang</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {warehouses.data.map((warehouse) => (
                                        <tr key={warehouse.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <Link href={WarehouseController.show.url(warehouse.id)} className="font-medium text-brand-700 hover:underline dark:text-brand-300">
                                                    {warehouse.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">{warehouse.code}</td>
                                            <td className="px-4 py-3 capitalize">{warehouse.type}</td>
                                            <td className="px-4 py-3">{warehouse.store ? warehouse.store.name : '-'}</td>
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                        Diarsipkan
                                                    </span>
                                                ) : (
                                                    <StatusBadge active={warehouse.is_active} />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    {canManage && showingArchived ? (
                                                        <button onClick={() => handleRestore(warehouse.id)} className={buttonClass('secondary')}>
                                                            <ArchiveRestore className="h-4 w-4" />
                                                            Pulihkan
                                                        </button>
                                                    ) : canManage ? (
                                                        <>
                                                            <Link href={WarehouseController.edit.url(warehouse.id)} className={buttonClass('secondary')}>
                                                                Ubah
                                                            </Link>
                                                            <DeleteAction url={WarehouseController.destroy.url(warehouse.id)} itemName={warehouse.name} />
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
                            links={warehouses.links}
                            from={warehouses.from}
                            to={warehouses.to}
                            total={warehouses.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

WarehousesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default WarehousesIndex;
