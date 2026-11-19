import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import { DeleteAction } from '@/components/delete-action';
import {
    buttonClass,
    Card,
    DescriptionList,
    PageHeader,
    StatusBadge,
} from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { Category } from '@/types/models';

function CategoriesShow({ category }: { category: Category }) {
    const { can } = useAuth();

    return (
        <>
            <Head title={category.name} />
            <PageHeader
                title={category.name}
                actions={
                    <>
                        <Link
                            href={CategoryController.index.url()}
                            className={buttonClass('secondary')}
                        >
                            Kembali
                        </Link>
                        {can('product.manage') && (
                            <>
                                <Link
                                    href={CategoryController.edit.url(
                                        category.id,
                                    )}
                                    className={buttonClass('primary')}
                                >
                                    Ubah
                                </Link>
                                <DeleteAction
                                    url={CategoryController.destroy.url(
                                        category.id,
                                    )}
                                    itemName={category.name}
                                    redirectOnSuccess
                                />
                            </>
                        )}
                    </>
                }
            />
            <Card className="p-6">
                <DescriptionList
                    items={[
                        {
                            label: 'Status',
                            value: <StatusBadge active={category.is_active} />,
                        },
                        {
                            label: 'Jumlah produk',
                            value: formatNumber(category.products_count ?? 0),
                        },
                        {
                            label: 'Dibuat',
                            value: formatDateTime(category.created_at),
                        },
                        {
                            label: 'Diperbarui',
                            value: formatDateTime(category.updated_at),
                        },
                    ]}
                />
            </Card>
        </>
    );
}

CategoriesShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default CategoriesShow;
