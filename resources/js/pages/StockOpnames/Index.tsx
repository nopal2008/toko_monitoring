import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import StockOpnameController from '@/actions/App/Http/Controllers/StockOpnameController';
import { Pagination } from '@/components/pagination';
import { buttonClass, Card, EmptyState, PageHeader } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/format';
import type { Paginated, StockOpname } from '@/types/models';

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    counting: {
        label: 'Penghitungan',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
    },
    submitted: {
        label: 'Diajukan',
        className: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
    },
    completed: {
        label: 'Selesai',
        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
};

function StockOpnamesIndex({
    opnames,
}: {
    opnames: Paginated<StockOpname>;
}) {
    const { can } = useAuth();
    const canManage = can('inventory.adjust');

    const createLink = canManage ? (
        <Link
            href={StockOpnameController.create.url()}
            className={buttonClass('primary')}
        >
            Stock opname baru
        </Link>
    ) : undefined;

    return (
        <>
            <Head title="Stock Opname" />
            <PageHeader
                title="Stock Opname"
                description="Hitung stok fisik dan sesuaikan selisih ke sistem."
                actions={createLink}
            />
            <Card>
                {opnames.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada stock opname"
                        description="Mulai penghitungan stok fisik untuk cabang Anda."
                        action={createLink}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[40rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-medium">
                                            Referensi
                                        </th>
                                        <th scope="col" className="px-4 py-3 font-medium">
                                            Gudang
                                        </th>
                                        <th scope="col" className="px-4 py-3 font-medium">
                                            Petugas
                                        </th>
                                        <th scope="col" className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th scope="col" className="px-4 py-3 font-medium">
                                            Dibuat
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {opnames.data.map((opname) => {
                                        const status = STATUS_LABELS[opname.status] ?? {
                                            label: opname.status,
                                            className: 'bg-muted text-muted-foreground',
                                        };

                                        return (
                                            <tr
                                                key={opname.id}
                                                className="transition-colors hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={StockOpnameController.show.url(
                                                            opname.id,
                                                        )}
                                                        className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                    >
                                                        {opname.reference}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {opname.warehouse?.name ?? '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {opname.counter?.name ?? '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {formatDateTime(opname.created_at)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={opnames.links}
                            from={opnames.from}
                            to={opnames.to}
                            total={opnames.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

StockOpnamesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default StockOpnamesIndex;
