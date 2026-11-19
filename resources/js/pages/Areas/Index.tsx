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

function AreasIndex({
    areas,
    showingArchived,
}: {
    areas: Paginated<Area>;
    showingArchived: boolean;
}) {
    const { can } = useAuth();
    const canManage = can('area.manage');

    const createLink = canManage ? (
        <Link
            href={AreaController.create.url()}
            className={buttonClass('primary')}
        >
            Tambah area
        </Link>
    ) : undefined;

    const toggleArchiveView = () => {
        router.get(
            AreaController.index.url(),
            { archived: showingArchived ? '0' : '1' },
            { preserveState: true, preserveScroll: true },
        );
    };

    const restoreArea = (id: number, name: string) => {
        if (
            confirm(
                `Apakah Anda yakin ingin memulihkan area "${name}" dari arsip?`,
            )
        ) {
            router.post(AreaController.restore.url(id));
        }
    };

    return (
        <>
            <Head title="Area" />
            <PageHeader
                title="Area"
                description="Kelola area wilayah untuk mengelompokkan cabang toko."
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
                {areas.data.length === 0 ? (
                    <EmptyState
                        title={
                            showingArchived
                                ? 'Belum ada area diarsipkan'
                                : 'Belum ada area'
                        }
                        description={
                            showingArchived
                                ? 'Area yang diarsipkan akan tampil di sini.'
                                : canManage
                                  ? 'Tambahkan area untuk mengelompokkan cabang toko berdasarkan wilayah.'
                                  : 'Area akan tampil di sini setelah dibuat oleh pengelola.'
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
                                            className="px-4 py-3 text-right font-medium"
                                        >
                                            Cabang
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-right font-medium"
                                        >
                                            Gudang
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
                                    {areas.data.map((area) => (
                                        <tr
                                            key={area.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <span className="font-medium text-muted-foreground">
                                                        {area.name}
                                                    </span>
                                                ) : (
                                                    <Link
                                                        href={AreaController.show.url(
                                                            area.id,
                                                        )}
                                                        className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                    >
                                                        {area.name}
                                                    </Link>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                                                    {area.code}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatNumber(
                                                    area.stores_count ?? 0,
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatNumber(
                                                    area.warehouses_count ?? 0,
                                                )}
                                            </td>
                                            {!showingArchived && (
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        active={area.is_active}
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
                                                                    restoreArea(
                                                                        area.id,
                                                                        area.name,
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
                                                                    href={AreaController.edit.url(
                                                                        area.id,
                                                                    )}
                                                                    className={buttonClass(
                                                                        'secondary',
                                                                    )}
                                                                >
                                                                    Ubah
                                                                </Link>
                                                                <DeleteAction
                                                                    url={AreaController.destroy.url(
                                                                        area.id,
                                                                    )}
                                                                    itemName={
                                                                        area.name
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
