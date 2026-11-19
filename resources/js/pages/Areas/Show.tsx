import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import AreaController from '@/actions/App/Http/Controllers/AreaController';
import { DeleteAction } from '@/components/delete-action';
import {
    buttonClass,
    Card,
    DescriptionList,
    PageHeader,
    StatusBadge,
} from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { Area } from '@/types/models';

function AreasShow({ area }: { area: Area }) {
    return (
        <>
            <Head title={area.name} />
            <PageHeader
                title={area.name}
                actions={
                    <>
                        <Link
                            href={AreaController.index.url()}
                            className={buttonClass('secondary')}
                        >
                            Kembali
                        </Link>
                        <Link
                            href={AreaController.edit.url(area.id)}
                            className={buttonClass('primary')}
                        >
                            Ubah
                        </Link>
                        <DeleteAction
                            url={AreaController.destroy.url(area.id)}
                            itemName={area.name}
                            redirectOnSuccess
                        />
                    </>
                }
            />
            <Card className="p-6">
                <DescriptionList
                    items={[
                        { label: 'Kode', value: area.code },
                        {
                            label: 'Status',
                            value: <StatusBadge active={area.is_active} />,
                        },
                        {
                            label: 'Cabang',
                            value: formatNumber(area.stores_count ?? 0),
                        },
                        {
                            label: 'Gudang',
                            value: formatNumber(area.warehouses_count ?? 0),
                        },
                        { label: 'Deskripsi', value: area.description },
                        {
                            label: 'Dibuat',
                            value: formatDateTime(area.created_at),
                        },
                        {
                            label: 'Diperbarui',
                            value: formatDateTime(area.updated_at),
                        },
                    ]}
                />
            </Card>
        </>
    );
}

AreasShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default AreasShow;
