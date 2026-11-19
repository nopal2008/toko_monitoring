import { Head, Link, router } from '@inertiajs/react';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/format';

type ArchivedItem = {
    id: number;
    name: string;
    type: string;
    deleted_at: string;
    count?: number;
};

type Props = {
    archivedCounts: {
        products: number;
        categories: number;
        suppliers: number;
        areas: number;
        warehouses: number;
        brands: number;
        units: number;
        stores: number;
        employees: number;
    };
};

const ARCHIVE_ITEMS = [
    { key: 'products', label: 'Produk', icon: '📦', color: 'bg-blue-50 dark:bg-blue-950' },
    { key: 'categories', label: 'Kategori', icon: '🏷️', color: 'bg-purple-50 dark:bg-purple-950' },
    { key: 'suppliers', label: 'Supplier', icon: '🚚', color: 'bg-orange-50 dark:bg-orange-950' },
    { key: 'areas', label: 'Area', icon: '🗺️', color: 'bg-green-50 dark:bg-green-950' },
    { key: 'warehouses', label: 'Gudang', icon: '🏢', color: 'bg-red-50 dark:bg-red-950' },
    { key: 'brands', label: 'Merek', icon: '🏷️', color: 'bg-yellow-50 dark:bg-yellow-950' },
    { key: 'units', label: 'Satuan', icon: '📏', color: 'bg-indigo-50 dark:bg-indigo-950' },
    { key: 'stores', label: 'Cabang', icon: '🏪', color: 'bg-cyan-50 dark:bg-cyan-950' },
    { key: 'employees', label: 'Karyawan', icon: '👤', color: 'bg-pink-50 dark:bg-pink-950' },
];

function ArchiveManager({ archivedCounts }: Props) {
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleViewArchive = (type: string) => {
        setSelectedType(type);
    };

    const handleRestoreAll = (type: string) => {
        if (!confirm(`Pulihkan SEMUA ${type} dari arsip?`)) {
            return;
        }

        setLoading(true);
        router.post(`/archive/${type}/restore-all`, {}, {
            onFinish: () => setLoading(false),
        });
    };

    const getCount = (key: string) => {
        return archivedCounts[key as keyof typeof archivedCounts] || 0;
    };

    return (
        <>
            <Head title="Manajemen Arsip" />
            <PageHeader
                title="Manajemen Arsip"
                description="Kelola item yang telah diarsipkan (soft delete) dan pulihkan jika diperlukan"
            />

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ARCHIVE_ITEMS.map((item) => {
                    const count = getCount(item.key);
                    return (
                        <Card
                            key={item.key}
                            className={`p-6 ${item.color} transition-all hover:shadow-lg`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {item.icon} {item.label}
                                    </p>
                                    <p className="mt-2 text-3xl font-bold">
                                        {formatNumber(count)}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {count === 0
                                            ? 'Tidak ada item diarsipkan'
                                            : `${count} item diarsipkan`}
                                    </p>
                                </div>
                            </div>

                            {count > 0 && (
                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={`/${item.key}?archived=1`}
                                        className={buttonClass('secondary', 'text-xs')}
                                    >
                                        <RotateCcw className="size-3" />
                                        Lihat & Pulihkan
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleRestoreAll(item.key)}
                                        disabled={loading}
                                        className={buttonClass(
                                            'primary',
                                            'text-xs',
                                        )}
                                        title="Pulihkan semua item dari arsip"
                                    >
                                        <RotateCcw className="size-3" />
                                        Pulihkan Semua
                                    </button>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Tips */}
            <Card className="border-l-4 border-l-blue-500 bg-blue-50 p-6 dark:bg-blue-950">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    ℹ️ Informasi Tentang Arsip
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <li>
                        • <strong>Soft Delete</strong>: Item tidak dihapus dari database,
                        hanya ditandai sebagai deleted
                    </li>
                    <li>
                        • <strong>Pulihkan Individual</strong>: Klik tombol "Lihat & Pulihkan"
                        untuk melihat list dan pulihkan satu per satu
                    </li>
                    <li>
                        • <strong>Pulihkan Massal</strong>: Klik tombol "Pulihkan Semua"
                        untuk restore semua item sekaligus
                    </li>
                    <li>
                        • <strong>Tidak Bisa Dihapus</strong>: Item yang sudah diarsipkan tetap
                        memiliki history transaksi
                    </li>
                </ul>
            </Card>
        </>
    );
}

ArchiveManager.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ArchiveManager;
