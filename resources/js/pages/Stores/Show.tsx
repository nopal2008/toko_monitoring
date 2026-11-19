import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import StoreController from '@/actions/App/Http/Controllers/StoreController';
import { DeleteAction } from '@/components/delete-action';
import {
    buttonClass,
    Card,
    DescriptionList,
    PageHeader,
    StatusBadge,
} from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime, formatNumber, trimTime } from '@/lib/format';
import type { Store } from '@/types/models';

function StoresShow({ store }: { store: Store }) {
    return (
        <>
            <Head title={store.name} />
            <PageHeader
                title={store.name}
                description={`Kode ${store.code}`}
                actions={
                    <>
                        <Link
                            href={StoreController.index.url()}
                            className={buttonClass('secondary')}
                        >
                            Kembali
                        </Link>
                        <Link
                            href={StoreController.edit.url(store.id)}
                            className={buttonClass('primary')}
                        >
                            Ubah
                        </Link>
                        <DeleteAction
                            url={StoreController.destroy.url(store.id)}
                            itemName={store.name}
                            redirectOnSuccess
                        />
                    </>
                }
            />
            <Card className="p-6">
                <DescriptionList
                    items={[
                        {
                            label: 'Status',
                            value: <StatusBadge active={store.is_active} />,
                        },
                        { label: 'Kota', value: store.city },
                        { label: 'Telepon', value: store.phone },
                        { label: 'Alamat', value: store.address },
                        {
                            label: 'Jam operasional',
                            value:
                                store.opening_time && store.closing_time
                                    ? `${trimTime(store.opening_time)} - ${trimTime(store.closing_time)}`
                                    : null,
                        },
                        {
                            label: 'Radius presensi',
                            value: `${formatNumber(store.radius_meter)} meter`,
                        },
                        {
                            label: 'Koordinat',
                            value:
                                store.latitude && store.longitude
                                    ? `${store.latitude}, ${store.longitude}`
                                    : null,
                        },
                        {
                            label: 'Jumlah pengguna',
                            value: formatNumber(store.users_count ?? 0),
                        },
                        {
                            label: 'Jumlah produk',
                            value: formatNumber(store.products_count ?? 0),
                        },
                        {
                            label: 'Dibuat',
                            value: formatDateTime(store.created_at),
                        },
                        {
                            label: 'Diperbarui',
                            value: formatDateTime(store.updated_at),
                        },
                    ]}
                />
            </Card>
        </>
    );
}

StoresShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default StoresShow;
