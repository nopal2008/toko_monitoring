import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import BrandController from '@/actions/App/Http/Controllers/BrandController';
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
import type { Brand } from '@/types/models';

function BrandsShow({ brand }: { brand: Brand }) {
    return (
        <>
            <Head title={brand.name} />
            <PageHeader
                title={brand.name}
                actions={
                    <>
                        <Link
                            href={BrandController.index.url()}
                            className={buttonClass('secondary')}
                        >
                            Kembali
                        </Link>
                        <Link
                            href={BrandController.edit.url(brand.id)}
                            className={buttonClass('primary')}
                        >
                            Ubah
                        </Link>
                        <DeleteAction
                            url={BrandController.destroy.url(brand.id)}
                            itemName={brand.name}
                            redirectOnSuccess
                        />
                    </>
                }
            />
            <Card className="p-6">
                <DescriptionList
                    items={[
                        { label: 'Slug', value: brand.slug },
                        {
                            label: 'Status',
                            value: <StatusBadge active={brand.is_active} />,
                        },
                        {
                            label: 'Produk',
                            value: formatNumber(brand.products_count ?? 0),
                        },
                        {
                            label: 'Dibuat',
                            value: formatDateTime(brand.created_at),
                        },
                        {
                            label: 'Diperbarui',
                            value: formatDateTime(brand.updated_at),
                        },
                    ]}
                />
            </Card>
        </>
    );
}

BrandsShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default BrandsShow;
