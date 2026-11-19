import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import WarehouseController from '@/actions/App/Http/Controllers/WarehouseController';
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
import type { Warehouse } from '@/types/models';

function WarehousesShow({ warehouse }: { warehouse: Warehouse }) {
    return (
        <>
            <Head title={warehouse.name} />
            <PageHeader
                title={warehouse.name}
                actions={
                    <>
                        <Link
                            href={WarehouseController.index.url()}
                            className={buttonClass('secondary')}
                        >
                            Kembali
                        </Link>
                        <Link
                            href={WarehouseController.edit.url(warehouse.id)}
                            className={buttonClass('primary')}
                        >
                            Ubah
                        </Link>
                        <DeleteAction
                            url={WarehouseController.destroy.url(warehouse.id)}
                            itemName={warehouse.name}
                            redirectOnSuccess
                        />
                    </>
                }
            />
            <Card className="p-6">
                <DescriptionList
                    items={[
                        { label: 'Kode', value: warehouse.code },
                        {
                            label: 'Tipe',
                            value: (
                                <span className="capitalize">
                                    {warehouse.type}
                                </span>
                            ),
                        },
                        {
                            label: 'Cabang',
                            value: warehouse.store ? warehouse.store.name : '-',
                        },
                        {
                            label: 'Status',
                            value: <StatusBadge active={warehouse.is_active} />,
                        },
                        { label: 'Alamat', value: warehouse.address },
                        {
                            label: 'Dibuat',
                            value: formatDateTime(warehouse.created_at),
                        },
                        {
                            label: 'Diperbarui',
                            value: formatDateTime(warehouse.updated_at),
                        },
                    ]}
                />
            </Card>
        </>
    );
}

WarehousesShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default WarehousesShow;
