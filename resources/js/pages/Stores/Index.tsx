import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import StoreController from '@/actions/App/Http/Controllers/StoreController';
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
import { formatNumber } from '@/lib/format';
import type { Paginated, Store } from '@/types/models';

function StoresIndex({ stores }: { stores: Paginated<Store> }) {
    const createLink = (
        <Link
            href={StoreController.create.url()}
            className={buttonClass('primary')}
        >
            Tambah cabang
        </Link>
    );

    return (
        <>
            <Head title="Cabang" />
            <PageHeader
                title="Cabang"
                description="Kelola cabang toko Anda."
                actions={createLink}
            />
            <Card>
                {stores.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada cabang"
                        description="Tambahkan cabang pertama untuk mulai memantau operasional."
                        action={createLink}
                    />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[44rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 font-medium">Cabang</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Kota</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Telepon</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Pengguna</th>
                                        <th scope="col" className="px-4 py-3 font-medium">Status</th>
                                        <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {stores.data.map((store) => (
                                        <tr key={store.id} className="transition-colors hover:bg-muted/40">
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={StoreController.show.url(store.id)}
                                                    className="font-medium text-brand-700 hover:underline dark:text-brand-300"
                                                >
                                                    {store.name}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">{store.code}</p>
                                            </td>
                                            <td className="px-4 py-3">{store.city ?? '-'}</td>
                                            <td className="px-4 py-3">{store.phone ?? '-'}</td>
                                            <td className="px-4 py-3 text-right">
                                                {formatNumber(store.users_count ?? 0)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge active={store.is_active} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={StoreController.edit.url(store.id)}
                                                        className={buttonClass('secondary')}
                                                    >
                                                        Ubah
                                                    </Link>
                                                    <DeleteAction
                                                        url={StoreController.destroy.url(store.id)}
                                                        itemName={store.name}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            links={stores.links}
                            from={stores.from}
                            to={stores.to}
                            total={stores.total}
                        />
                    </>
                )}
            </Card>
        </>
    );
}

StoresIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default StoresIndex;
