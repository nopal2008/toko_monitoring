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
import type { Paginated, Warehouse } from '@/types/models';

function WarehousesIndex({
    warehouses,
    showingArchived,
}: {
    warehouses: Paginated<Warehouse>;
    showingArchived: boolean;
}) {
    const { can } = useAuth();
    const canManage = can('warehouse.manage');

    const createLink = canManage ? (
        <Link
            href={WarehouseController.create.url()}
            className={buttonClass('primary')}
        >
            Tambah gudang
        </Link>
    ) : undefined;

    const toggleArchiveView = () => {
        router.get(
            WarehouseController.index.url(),
            { archived: showingArchived ? '0' : '1' },
            { preserveState: true, preserveScroll: true },
        );
    };

    const restoreWarehouse = (id: number, name: string) => {
        if (
            confirm(
                `Apakah Anda yakin ingin memulihkan gudang "${name}" dari arsip?`,
            )
        ) {
            router.post(WarehouseController.restore.url(id));
        }
    };

    return (
        <>
            <Head title="Gudang" />
            <PageHeader
                title="Gudang"
                description="Kelola gudang pusat dan gudang cabang untuk penyimpanan produk."
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
                {warehouses.data.length === 0 ? (
                    <EmptyState
                        title={
                            showingArchived
                                ? 'Belum ada gudang diarsipkan'
                                : 'Belum ada gudang'
                        }
                        description={
                            showingArchived
                                ? 'Gudang yang diarsipkan akan tampil di sini.'
                                : canManage
                                  ? 'Tambahkan gudang untuk mengelola penyimpanan produk.'
                                  : 'Gudang akan tampil di sini setelah dibuat oleh pengelola.'
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
                                            className="px-4 py-3 font-medium"
                                        >
                                            Kode
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-medium"
                                        >
                                            Tipe
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-medium"
                                        >
                                            Cabang
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
                                    {warehouses.data.map((warehouse) => (
                                        <tr
                                            key={warehouse.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <span className="font-medium text-muted-foreground">
                                                        {warehouse.name}
                                                    </span>
                                                ) : (
                                                    <Link
                                                        href={WarehouseController.show.url(
                                                            warehouse.id,
                                                        )}
                                                        className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                    >
                                                        {warehouse.name}
                                                    </Link>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                                    {warehouse.code}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        warehouse.type ===
                                                        'central'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    }`}
                                                >
                                                    {warehouse.type ===
                                                    'central'
                                                        ? 'Pusat'
                                                        : 'Cabang'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {warehouse.store?.name ?? '-'}
                                            </td>
                                            {!showingArchived && (
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        active={
                                                            warehouse.is_active
                                                        }
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
                                                                    restoreWarehouse(
                                                                        warehouse.id,
                                                                        warehouse.name,
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
                                                                    href={WarehouseController.edit.url(
                                                                        warehouse.id,
                                                                    )}
                                                                    className={buttonClass(
                                                                        'secondary',
                                                                    )}
                                                                >
                                                                    Ubah
                                                                </Link>
                                                                <DeleteAction
                                                                    url={WarehouseController.destroy.url(
                                                                        warehouse.id,
                                                                    )}
                                                                    itemName={
                                                                        warehouse.name
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
