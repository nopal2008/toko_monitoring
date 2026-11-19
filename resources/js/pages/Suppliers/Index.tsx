import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import { DeleteAction } from '@/components/delete-action';
import { Pagination } from '@/components/pagination';
import {
    buttonClass,
    Card,
    EmptyState,
    PageHeader,
    StatusBadge,
} from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import type { Paginated, Supplier } from '@/types/models';

function SuppliersIndex({ suppliers }: { suppliers: Paginated<Supplier> }) {
    const createLink = (
        <Link
            href={SupplierController.create.url()}
            className={buttonClass('primary')}
        >
            Tambah supplier
        </Link>
    );

    return (
        <>
            <Head title="Supplier" />
            <PageHeader
                title="Supplier"
                description="Kelola pemasok barang."
                actions={createLink}
            />
            <Card>
                {suppliers.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada supplier"
                        description="Tambahkan supplier untuk mencatat pemasok barang."
                        action={createLink}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[40rem] text-sm">
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
                                            Kontak
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 font-medium"
                                        >
                                            Status
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-4 py-3 text-right font-medium"
                                        >
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {suppliers.data.map((supplier) => (
                                        <tr
                                            key={supplier.id}
                                            className="transition-colors hover:bg-muted/40"
                                        >
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={SupplierController.show.url(
                                                        supplier.id,
                                                    )}
                                                    className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                >
                                                    {supplier.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p>{supplier.phone ?? '-'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {supplier.email ?? '-'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge
                                                    active={supplier.is_active}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={SupplierController.edit.url(
                                                            supplier.id,
                                                        )}
                                                        className={buttonClass(
                                                            'secondary',
                                                        )}
                                                    >
                                                        Ubah
                                                    </Link>
                                                    <DeleteAction
                                                        url={SupplierController.destroy.url(
                                                            supplier.id,
                                                        )}
                                                        itemName={supplier.name}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={suppliers.links}
                            from={suppliers.from}
                            to={suppliers.to}
                            total={suppliers.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

SuppliersIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default SuppliersIndex;
