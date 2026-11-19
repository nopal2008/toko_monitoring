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

function UnitsIndex({
    units,
    showingArchived,
}: {
    units: Paginated<Unit>;
    showingArchived: boolean;
}) {
    const { can } = useAuth();
    const canManage = can('unit.manage');

    const createLink = canManage ? (
        <Link
            href={UnitController.create.url()}
            className={buttonClass('primary')}
        >
            Tambah satuan
        </Link>
    ) : undefined;

    const toggleArchiveView = () => {
        router.get(
            UnitController.index.url(),
            { archived: showingArchived ? '0' : '1' },
            { preserveState: true, preserveScroll: true },
        );
    };

    const restoreUnit = (id: number, name: string) => {
        if (
            confirm(
                `Apakah Anda yakin ingin memulihkan satuan "${name}" dari arsip?`,
            )
        ) {
            router.post(UnitController.restore.url(id));
        }
    };

    return (
        <>
            <Head title="Satuan" />
            <PageHeader
                title="Satuan"
                description="Kelola satuan produk seperti pcs, kg, liter."
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
                {units.data.length === 0 ? (
                    <EmptyState
                        title={
                            showingArchived
                                ? 'Belum ada satuan diarsipkan'
                                : 'Belum ada satuan'
                        }
                        description={
                            showingArchived
                                ? 'Satuan yang diarsipkan akan tampil di sini.'
                                : canManage
                                  ? 'Tambahkan satuan untuk mengukur produk seperti pcs, kg, liter.'
                                  : 'Satuan akan tampil di sini setelah dibuat oleh pengelola.'
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
                                            Simbol
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
                                    {units.data.map((unit) => (
                                        <tr
                                            key={unit.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-4 py-3">
                                                {showingArchived ? (
                                                    <span className="font-medium text-muted-foreground">
                                                        {unit.name}
                                                    </span>
                                                ) : (
                                                    <Link
                                                        href={UnitController.show.url(
                                                            unit.id,
                                                        )}
                                                        className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                    >
                                                        {unit.name}
                                                    </Link>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="rounded bg-muted px-2 py-0.5 text-xs font-semibold">
                                                    {unit.symbol}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatNumber(
                                                    unit.products_count ?? 0,
                                                )}
                                            </td>
                                            {!showingArchived && (
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        active={unit.is_active}
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
                                                                    restoreUnit(
                                                                        unit.id,
                                                                        unit.name,
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
                                                                    href={UnitController.edit.url(
                                                                        unit.id,
                                                                    )}
                                                                    className={buttonClass(
                                                                        'secondary',
                                                                    )}
                                                                >
                                                                    Ubah
                                                                </Link>
                                                                <DeleteAction
                                                                    url={UnitController.destroy.url(
                                                                        unit.id,
                                                                    )}
                                                                    itemName={
                                                                        unit.name
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
