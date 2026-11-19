import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MessageCircle, Printer } from 'lucide-react';
import { buttonClass } from '@/components/ui';
import { formatCurrency, formatDateTime } from '@/lib/format';
import type { TransactionPayment } from '@/types/models';
import {
    index as transactionsIndex,
    show as transactionShow,
} from '@/routes/transactions';

type ReceiptItem = {
    id: number;
    product_name: string;
    product_sku: string | null;
    quantity: number;
    price: string;
    discount_amount: string;
    subtotal: string;
};

type ReceiptTransaction = {
    id: number;
    invoice_number: string;
    subtotal_amount: string;
    discount_amount: string;
    tax_amount: string;
    total_amount: string;
    paid_amount: string;
    change_amount: string;
    payment_method: string;
    status: string;
    notes: string | null;
    created_at: string;
    completed_at: string | null;
    store: {
        id: number;
        name: string;
        code: string;
        address: string | null;
        city: string | null;
        phone: string | null;
    } | null;
    cashier: { id: number; name: string } | null;
    items: ReceiptItem[];
    payments: TransactionPayment[];
};

const PAYMENT_LABELS: Record<string, string> = {
    cash: 'Tunai',
    debit: 'Kartu Debit',
    credit: 'Kartu Kredit',
    card: 'Kartu',
    qris: 'QRIS',
    ewallet: 'E-Wallet',
    transfer: 'Transfer',
    split: 'Split Payment',
    other: 'Lainnya',
};

function TransactionsReceipt({
    transaction,
    settings,
}: {
    transaction: ReceiptTransaction;
    settings: { footer: string | null; tax_percentage: string | null };
}) {
    const shareText = [
        `Struk ${transaction.invoice_number}`,
        transaction.store?.name ?? '',
        `Total: ${formatCurrency(transaction.total_amount)}`,
        `Metode: ${PAYMENT_LABELS[transaction.payment_method] ?? transaction.payment_method}`,
    ]
        .filter(Boolean)
        .join('\n');

    async function shareReceipt() {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `Struk ${transaction.invoice_number}`,
                    text: shareText,
                });

                return;
            } catch {
                // fall through to WhatsApp
            }
        }

        window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            '_blank',
            'noopener,noreferrer',
        );
    }

    return (
        <>
            <Head title={`Struk ${transaction.invoice_number}`} />

            <div className="min-h-screen bg-muted/40 py-6 print:bg-white print:py-0">
                <div className="mx-auto w-full max-w-md px-4 print:max-w-none print:px-0">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
                        <div className="flex gap-2">
                            <Link
                                href={transactionsIndex.url()}
                                className={buttonClass(
                                    'secondary',
                                    'h-9 px-3 text-xs',
                                )}
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Riwayat
                            </Link>
                            <Link
                                href={transactionShow.url(transaction.id)}
                                className={buttonClass(
                                    'secondary',
                                    'h-9 px-3 text-xs',
                                )}
                            >
                                Detail
                            </Link>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={shareReceipt}
                                className={buttonClass(
                                    'secondary',
                                    'h-9 px-3 text-xs',
                                )}
                            >
                                <MessageCircle className="h-4 w-4" />
                                Kirim Digital
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className={buttonClass(
                                    'primary',
                                    'h-9 px-3 text-xs',
                                )}
                            >
                                <Printer className="h-4 w-4" />
                                Cetak Struk
                            </button>
                        </div>
                    </div>

                    <div className="mx-auto w-full max-w-[80mm] bg-white p-4 font-mono text-[12px] leading-relaxed text-black shadow-sm print:max-w-[80mm] print:shadow-none">
                        <div className="text-center">
                            <p className="text-base font-bold uppercase">
                                {transaction.store?.name ?? 'Toko'}
                            </p>
                            {transaction.store?.address && (
                                <p>{transaction.store.address}</p>
                            )}
                            {transaction.store?.city && (
                                <p>{transaction.store.city}</p>
                            )}
                            {transaction.store?.phone && (
                                <p>Telp: {transaction.store.phone}</p>
                            )}
                        </div>

                        <div className="my-3 border-t border-dashed border-black" />

                        <div className="space-y-0.5">
                            <div className="flex justify-between">
                                <span>No. Invoice</span>
                                <span>{transaction.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tanggal</span>
                                <span>
                                    {formatDateTime(
                                        transaction.completed_at ??
                                            transaction.created_at,
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kasir</span>
                                <span>{transaction.cashier?.name ?? '-'}</span>
                            </div>
                        </div>

                        <div className="my-3 border-t border-dashed border-black" />

                        <div className="space-y-2">
                            {transaction.items.map((item) => (
                                <div key={item.id}>
                                    <p className="font-semibold">
                                        {item.product_name}
                                    </p>
                                    <div className="flex justify-between">
                                        <span>
                                            {item.quantity} x{' '}
                                            {formatCurrency(item.price)}
                                        </span>
                                        <span>
                                            {formatCurrency(item.subtotal)}
                                        </span>
                                    </div>
                                    {Number(item.discount_amount) > 0 && (
                                        <div className="flex justify-between">
                                            <span>Diskon item</span>
                                            <span>
                                                -
                                                {formatCurrency(
                                                    item.discount_amount,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="my-3 border-t border-dashed border-black" />

                        <div className="space-y-0.5">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                    {formatCurrency(transaction.subtotal_amount)}
                                </span>
                            </div>
                            {Number(transaction.discount_amount) > 0 && (
                                <div className="flex justify-between">
                                    <span>Diskon</span>
                                    <span>
                                        -
                                        {formatCurrency(
                                            transaction.discount_amount,
                                        )}
                                    </span>
                                </div>
                            )}
                            {Number(transaction.tax_amount) > 0 && (
                                <div className="flex justify-between">
                                    <span>
                                        Pajak
                                        {settings.tax_percentage
                                            ? ` (${settings.tax_percentage}%)`
                                            : ''}
                                    </span>
                                    <span>
                                        {formatCurrency(transaction.tax_amount)}
                                    </span>
                                </div>
                            )}
                            <div className="mt-1 flex justify-between border-t border-dashed border-black pt-1 text-sm font-bold">
                                <span>TOTAL</span>
                                <span>
                                    {formatCurrency(transaction.total_amount)}
                                </span>
                            </div>
                        </div>

                        <div className="my-3 border-t border-dashed border-black" />

                        <div className="space-y-0.5">
                            {transaction.payments.length > 0 ? (
                                transaction.payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex justify-between"
                                    >
                                        <span>
                                            {PAYMENT_LABELS[payment.method] ??
                                                payment.method}
                                        </span>
                                        <span>
                                            {formatCurrency(payment.amount)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="flex justify-between">
                                    <span>
                                        {PAYMENT_LABELS[
                                            transaction.payment_method
                                        ] ?? transaction.payment_method}
                                    </span>
                                    <span>
                                        {formatCurrency(transaction.paid_amount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Dibayar</span>
                                <span>
                                    {formatCurrency(transaction.paid_amount)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kembalian</span>
                                <span>
                                    {formatCurrency(transaction.change_amount)}
                                </span>
                            </div>
                        </div>

                        {transaction.notes && (
                            <>
                                <div className="my-3 border-t border-dashed border-black" />
                                <p>Catatan: {transaction.notes}</p>
                            </>
                        )}

                        <div className="my-3 border-t border-dashed border-black" />

                        <div className="text-center">
                            <p>
                                {settings.footer ??
                                    'Terima kasih atas kunjungan Anda!'}
                            </p>
                            <p className="mt-2 text-[10px]">
                                Powered by Store Monitoring
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TransactionsReceipt;
