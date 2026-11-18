import { Head, Link, useForm } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { ArrowLeft, Ban, CheckCircle, Clock, Receipt, Store, User } from 'lucide-react';
import { Card, DescriptionList, PageHeader, buttonClass } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateOnly } from '@/lib/format';
import { cn } from '@/lib/utils';
import { cancel as transactionCancel, index as transactionsIndex } from '@/routes/transactions';

type TransactionItemData = {
    id: number;
    product_id: number | null;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    price: string;
    discount_amount: string;
    subtotal: string;
    product: { id: number; name: string; sku: string } | null;
};

type TransactionDetail = {
    id: number;
    invoice_number: string;
    store_id: number;
    user_id: number;
    subtotal_amount: string;
    discount_amount: string;
    tax_amount: string;
    total_amount: string;
    paid_amount: string | null;
    change_amount: string | null;
    payment_method: string;
    status: 'pending' | 'completed' | 'cancelled';
    notes: string | null;
    created_at: string;
    completed_at: string | null;
    cancelled_at: string | null;
    cancel_reason: string | null;
    store: { id: number; name: string } | null;
    cashier: { id: number; name: string } | null;
    items: TransactionItemData[];
};

type Props = {
    transaction: TransactionDetail;
};

function StatusBadge({ status }: { status: TransactionDetail['status'] }) {
    const config = {
        pending: {
            label: 'Menunggu',
            icon: Clock,
            className: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        completed: {
            label: 'Selesai',
            icon: CheckCircle,
            className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
        cancelled: {
            label: 'Dibatalkan',
            icon: Ban,
            className: 'bg-rose-100 text-rose-800 border-rose-200',
        },
    }[status];

    const Icon = config.icon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                config.className,
            )}
        >
            <Icon className="h-3.5 w-3.5" />
            {config.label}
        </span>
    );
}

function TransactionsShow({ transaction }: Props) {
    const { can } = useAuth();
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const cancelForm = useForm({
        reason: '',
    });

    function handleCancel(e: React.FormEvent) {
        e.preventDefault();
        cancelForm.post(transactionCancel.url(transaction.id), {
            onSuccess: () => {
                setCancelModalOpen(false);
                cancelForm.reset();
            },
        });
    }

    return (
        <>
            <Head title={`Transaksi ${transaction.invoice_number}`} />

            <div className="mb-4">
                <Link
                    href={transactionsIndex.url()}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Daftar Transaksi</span>
                </Link>
            </div>

            <PageHeader
                title={`Invoice: ${transaction.invoice_number}`}
                description={`Dicatat pada ${formatDateOnly(transaction.created_at)}`}
                actions={
                    <div className="flex items-center gap-3">
                        <StatusBadge status={transaction.status} />
                        {transaction.status !== 'cancelled' && can('transaction.cancel') && (
                            <button
                                type="button"
                                onClick={() => setCancelModalOpen(true)}
                                className={buttonClass('danger', 'h-9 px-3 text-xs')}
                            >
                                <Ban className="h-3.5 w-3.5" />
                                <span>Batalkan Transaksi</span>
                            </button>
                        )}
                    </div>
                }
            />

            {/* Cancel Modal */}
            {cancelModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cancel-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                >
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 id="cancel-title" className="text-lg font-semibold text-slate-900">
                            Batalkan Transaksi?
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Tindakan ini akan mengembalikan stok produk terkait. Masukkan alasan pembatalan:
                        </p>
                        <form onSubmit={handleCancel} className="mt-4 space-y-4">
                            <div>
                                <label htmlFor="cancel-reason" className="mb-1 block text-sm font-medium text-slate-700">
                                    Alasan Pembatalan <span className="text-rose-600">*</span>
                                </label>
                                <textarea
                                    id="cancel-reason"
                                    required
                                    rows={3}
                                    value={cancelForm.data.reason}
                                    onChange={(e) => cancelForm.setData('reason', e.target.value)}
                                    placeholder="Contoh: Pelanggan salah memilih metode pembayaran / barang rusak"
                                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                />
                                {cancelForm.errors.reason && (
                                    <p className="mt-1 text-xs text-rose-600">{cancelForm.errors.reason}</p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCancelModalOpen(false)}
                                    disabled={cancelForm.processing}
                                    className={buttonClass('secondary')}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={cancelForm.processing}
                                    className={buttonClass('danger')}
                                >
                                    {cancelForm.processing ? 'Memproses...' : 'Ya, Batalkan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Banner jika dibatalkan */}
            {transaction.status === 'cancelled' && (
                <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                    <p className="font-semibold">Transaksi telah dibatalkan</p>
                    {transaction.cancel_reason && (
                        <p className="mt-1 text-rose-700">Alasan: {transaction.cancel_reason}</p>
                    )}
                </div>
            )}

            {/* Ringkasan Transaksi */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
                <Card className="p-5">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">
                        Informasi Transaksi
                    </h2>
                    <DescriptionList
                        items={[
                            {
                                label: 'Toko / Cabang',
                                value: (
                                    <span className="inline-flex items-center gap-1.5 font-medium">
                                        <Store className="h-4 w-4 text-slate-500" />
                                        {transaction.store?.name ?? '-'}
                                    </span>
                                ),
                            },
                            {
                                label: 'Kasir',
                                value: (
                                    <span className="inline-flex items-center gap-1.5 font-medium">
                                        <User className="h-4 w-4 text-slate-500" />
                                        {transaction.cashier?.name ?? '-'}
                                    </span>
                                ),
                            },
                            {
                                label: 'Metode Pembayaran',
                                value: (
                                    <span className="font-medium uppercase">
                                        {transaction.payment_method || 'Tunai'}
                                    </span>
                                ),
                            },
                            {
                                label: 'Waktu Selesai',
                                value: transaction.completed_at
                                    ? formatDateOnly(transaction.completed_at)
                                    : '-',
                            },
                            {
                                label: 'Catatan',
                                value: transaction.notes || '-',
                            },
                        ]}
                    />
                </Card>

                <Card className="p-5">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">
                        Rincian Pembayaran
                    </h2>
                    <dl className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-slate-600">Subtotal</dt>
                            <dd className="font-medium text-slate-900">
                                {formatCurrency(transaction.subtotal_amount)}
                            </dd>
                        </div>
                        {Number(transaction.discount_amount) > 0 && (
                            <div className="flex justify-between text-emerald-700">
                                <dt>Diskon</dt>
                                <dd className="font-medium">
                                    -{formatCurrency(transaction.discount_amount)}
                                </dd>
                            </div>
                        )}
                        {Number(transaction.tax_amount) > 0 && (
                            <div className="flex justify-between">
                                <dt className="text-slate-600">Pajak</dt>
                                <dd className="font-medium text-slate-900">
                                    +{formatCurrency(transaction.tax_amount)}
                                </dd>
                            </div>
                        )}
                        <div className="border-t border-slate-200 pt-3">
                            <div className="flex justify-between text-base font-bold text-slate-900">
                                <dt>Total</dt>
                                <dd className="text-emerald-700">
                                    {formatCurrency(transaction.total_amount)}
                                </dd>
                            </div>
                        </div>
                        {transaction.paid_amount && (
                            <div className="flex justify-between pt-2 text-slate-600">
                                <dt>Jumlah Dibayar</dt>
                                <dd className="font-medium text-slate-900">
                                    {formatCurrency(transaction.paid_amount)}
                                </dd>
                            </div>
                        )}
                        {transaction.change_amount && (
                            <div className="flex justify-between text-slate-600">
                                <dt>Kembalian</dt>
                                <dd className="font-medium text-slate-900">
                                    {formatCurrency(transaction.change_amount)}
                                </dd>
                            </div>
                        )}
                    </dl>
                </Card>
            </div>

            {/* Daftar Produk */}
            <Card>
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-base font-semibold text-slate-900">
                        Item Transaksi ({transaction.items.length})
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[36rem] text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                            <tr>
                                <th scope="col" className="px-5 py-3">Produk</th>
                                <th scope="col" className="px-5 py-3">SKU</th>
                                <th scope="col" className="px-5 py-3 text-right">Harga Satuan</th>
                                <th scope="col" className="px-5 py-3 text-center">Jumlah</th>
                                <th scope="col" className="px-5 py-3 text-right">Diskon</th>
                                <th scope="col" className="px-5 py-3 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transaction.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-5 py-3 font-medium text-slate-900">
                                        {item.product?.name ?? item.product_name}
                                    </td>
                                    <td className="px-5 py-3 font-mono text-xs text-slate-600">
                                        {item.product?.sku ?? item.product_sku ?? '-'}
                                    </td>
                                    <td className="px-5 py-3 text-right text-slate-700">
                                        {formatCurrency(item.price)}
                                    </td>
                                    <td className="px-5 py-3 text-center font-medium text-slate-900">
                                        {item.quantity}
                                    </td>
                                    <td className="px-5 py-3 text-right text-slate-600">
                                        {Number(item.discount_amount) > 0
                                            ? `-${formatCurrency(item.discount_amount)}`
                                            : '-'}
                                    </td>
                                    <td className="px-5 py-3 text-right font-semibold text-slate-900">
                                        {formatCurrency(item.subtotal)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    );
}

TransactionsShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default TransactionsShow;
