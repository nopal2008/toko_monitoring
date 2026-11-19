import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import UnitController from '@/actions/App/Http/Controllers/UnitController';
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
import type { Unit } from '@/types/models';

function UnitsShow({ unit }: { unit: Unit }) {
    return (
        <>
            <Head title={unit.name} />
            <PageHeader
                title={unit.name}
                actions={
                    <>
                        <Link
                            href={UnitController.index.url()}
                            className={buttonClass('secondary')}
                        >
                            Kembali
                        </Link>
                        <Link
                            href={UnitController.edit.url(unit.id)}
                            className={buttonClass('primary')}
                        >
                            Ubah
                        </Link>
                        <DeleteAction
                            url={UnitController.destroy.url(unit.id)}
                            itemName={unit.name}
                            redirectOnSuccess
                        />
                    </>
                }
            />
            <Card className="p-6">
                <DescriptionList
                    items={[
                        { label: 'Simbol', value: unit.symbol },
                        {
                            label: 'Status',
                            value: <StatusBadge active={unit.is_active} />,
                        },
                        {
                            label: 'Produk',
                            value: formatNumber(unit.products_count ?? 0),
                        },
                        {
                            label: 'Dibuat',
                            value: formatDateTime(unit.created_at),
                        },
                        {
                            label: 'Diperbarui',
                            value: formatDateTime(unit.updated_at),
                        },
                    ]}
                />
            </Card>
        </>
    );
}

UnitsShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default UnitsShow;
