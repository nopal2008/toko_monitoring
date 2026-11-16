import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import { DeleteAction } from '@/components/delete-action';
import {
    buttonClass,
    Card,
    DescriptionList,
    PageHeader,
    StatusBadge,
} from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/format';
import type { Supplier } from '@/types/models';

function SuppliersShow({ supplier }: { supplier: Supplier }) {
    return (
        <>
            <Head title={supplier.name} />
            <PageHeader
                title={supplier.name}
                actions={
                    <>
                        <Link href={SupplierController.index.url()} className={buttonClass('secondary')}>
                            Kembali
                        </Link>
                        <Link href={SupplierController.edit.url(supplier.id)} className={buttonClass('primary')}>
                            Ubah
                        </Link>
                        <DeleteAction
                            url={SupplierController.destroy.url(supplier.id)}
                            itemName={supplier.name}
                            redirectOnSuccess
                        />
                    </>
                }
            />
            <Card className="p-6">
                <DescriptionList
                    items={[
                        { label: 'Status', value: <StatusBadge active={supplier.is_active} /> },
                        { label: 'Telepon', value: supplier.phone },
                        { label: 'Email', value: supplier.email },
                        { label: 'Alamat', value: supplier.address },
                        { label: 'Dibuat', value: formatDateTime(supplier.created_at) },
                        { label: 'Diperbarui', value: formatDateTime(supplier.updated_at) },
                    ]}
                />
            </Card>
        </>
    );
}

SuppliersShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default SuppliersShow;
