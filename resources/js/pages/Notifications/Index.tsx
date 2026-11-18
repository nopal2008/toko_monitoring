import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { AlertCircle, Bell, Check, Info, Package, Receipt } from 'lucide-react';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import { usePolling } from '@/hooks/use-polling';
import AppLayout from '@/layouts/app-layout';
import { formatDateOnly } from '@/lib/format';
import { cn } from '@/lib/utils';
import { read as notificationsRead } from '@/routes/notifications';
import type { Paginated } from '@/types/models';

type NotificationItem = {
    id: string;
    type: string;
    data: {
        message?: string;
        title?: string;
        type?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
};

type Props = {
    notifications: Paginated<NotificationItem>;
};

function getNotificationIcon(type: string) {
    if (type.toLowerCase().includes('stock') || type.toLowerCase().includes('inventory')) {
        return <Package className="h-5 w-5 text-amber-600" />;
    }
    if (type.toLowerCase().includes('transaction') || type.toLowerCase().includes('sale')) {
        return <Receipt className="h-5 w-5 text-emerald-600" />;
    }
    if (type.toLowerCase().includes('alert') || type.toLowerCase().includes('danger')) {
        return <AlertCircle className="h-5 w-5 text-rose-600" />;
    }
    return <Info className="h-5 w-5 text-sky-600" />;
}

function NotificationsIndex({ notifications }: Props) {
    // Polling setiap 30 detik untuk memperbarui daftar notifikasi
    usePolling(30_000, ['notifications']);

    function markAsRead(id: string) {
        router.post(
            notificationsRead.url(id),
            {},
            { preserveScroll: true, preserveState: true },
        );
    }

    const unreadCount = notifications.data.filter((n) => !n.read_at).length;

    return (
        <>
            <Head title="Notifikasi" />
            <PageHeader
                title="Pusat Notifikasi"
                description={
                    unreadCount > 0
                        ? `Anda memiliki ${unreadCount} notifikasi yang belum dibaca.`
                        : 'Semua notifikasi penting terkait toko Anda.'
                }
            />

            <Card>
                {notifications.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada notifikasi"
                        description="Peringatan stok menipis, konfirmasi transaksi, dan informasi penting lainnya akan muncul di sini."
                    />
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.data.map((item) => {
                            const isUnread = !item.read_at;
                            const message =
                                item.data?.message ??
                                item.data?.title ??
                                'Notifikasi sistem';

                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        'flex flex-col gap-3 p-4 transition sm:flex-row sm:items-center sm:justify-between',
                                        isUnread ? 'bg-emerald-50/40' : 'bg-white',
                                    )}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                            {getNotificationIcon(item.type)}
                                        </div>
                                        <div>
                                            <p
                                                className={cn(
                                                    'text-sm leading-relaxed text-slate-900',
                                                    isUnread && 'font-semibold',
                                                )}
                                            >
                                                {message}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                {formatDateOnly(item.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {isUnread && (
                                        <button
                                            type="button"
                                            onClick={() => markAsRead(item.id)}
                                            className={buttonClass(
                                                'secondary',
                                                'h-8 shrink-0 self-start text-xs sm:self-center',
                                            )}
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                            <span>Tandai Dibaca</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                <Pagination
                    links={notifications.links}
                    from={notifications.from}
                    to={notifications.to}
                    total={notifications.total}
                />
            </Card>
        </>
    );
}

NotificationsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default NotificationsIndex;
