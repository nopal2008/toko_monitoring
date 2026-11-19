import { Head, router, useForm } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Banknote,
    CreditCard,
    Landmark,
    Minus,
    Pause,
    Play,
    Plus,
    Printer,
    QrCode,
    ScanLine,
    Search,
    ShoppingCart,
    Trash2,
    Wallet,
    X,
} from 'lucide-react';
import { Card, PageHeader, buttonClass } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
    CategoryOption,
    PosHold,
    PosProduct,
    Store,
} from '@/types/models';
import { store as transactionStore } from '@/routes/transactions';
import { index as posIndex, quote as posQuote, search as posSearch } from '@/routes/pos';
import { destroy as holdDestroy, store as holdStore } from '@/routes/pos/holds';

type CartItem = {
    product: PosProduct;
    quantity: number;
};

type PaymentRow = {
    method: string;
    amount: string;
    reference_number: string;
};

type Quote = {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    tax_percentage: string;
    promotion_names: string[];
    items: Array<{
        product_id: number;
        quantity: number;
        unit_price: number;
        discount: number;
        subtotal: number;
        promotion_name: string | null;
    }>;
};

type Props = {
    products: PosProduct[];
    stores: Store[];
    categories: CategoryOption[];
    selectedStoreId: number;
    holds: PosHold[];
    taxPercentage: string;
};

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Tunai', icon: Banknote },
    { value: 'debit', label: 'Kartu Debit', icon: CreditCard },
    { value: 'credit', label: 'Kartu Kredit', icon: CreditCard },
    { value: 'qris', label: 'QRIS', icon: QrCode },
    { value: 'ewallet', label: 'E-Wallet', icon: Wallet },
    { value: 'transfer', label: 'Transfer', icon: Landmark },
    { value: 'other', label: 'Lainnya', icon: ShoppingCart },
];

function xsrfToken() {
    if (typeof document === 'undefined') {
        return '';
    }

    const match = document.cookie.match(/(^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[2]) : '';
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
        credentials: 'same-origin',
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrfToken(),
            ...(options.headers ?? {}),
        },
    });

    if (!response.ok) {
        throw new Error('Permintaan gagal diproses.');
    }

    return (await response.json()) as T;
}

function PosIndex({
    products,
    stores,
    categories,
    selectedStoreId,
    holds,
    taxPercentage,
}: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [scanValue, setScanValue] = useState('');
    const [scanError, setScanError] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null,
    );
    const [storeId, setStoreId] = useState(selectedStoreId);
    const [manualDiscount, setManualDiscount] = useState('0');
    const [quote, setQuote] = useState<Quote | null>(null);
    const [quoteError, setQuoteError] = useState<string | null>(null);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [payments, setPayments] = useState<PaymentRow[]>([
        { method: 'cash', amount: '', reference_number: '' },
    ]);
    const [actionError, setActionError] = useState<string | null>(null);
    const scanRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        store_id: storeId,
        items: [] as Array<{ product_id: number; quantity: number }>,
        payments: [] as PaymentRow[],
        discount_amount: '0',
        print_receipt: true,
        notes: '',
    });

    useEffect(() => {
        scanRef.current?.focus();
    }, []);

    useEffect(() => {
        if (cart.length === 0) {
            setQuote(null);
            setQuoteError(null);
            return;
        }

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            try {
                const result = await fetchJson<Quote>(posQuote.url(), {
                    method: 'POST',
                    body: JSON.stringify({
                        store_id: storeId,
                        items: cart.map((item) => ({
                            product_id: item.product.id,
                            quantity: item.quantity,
                        })),
                        discount_amount: manualDiscount || '0',
                    }),
                });

                if (!cancelled) {
                    setQuote(result);
                    setQuoteError(null);
                }
            } catch (error) {
                if (!cancelled) {
                    setQuoteError(
                        error instanceof Error
                            ? error.message
                            : 'Gagal menghitung total.',
                    );
                }
            }
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [cart, manualDiscount, storeId]);

    const filteredProducts = useMemo(
        () =>
            products.filter((product) => {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    query === '' ||
                    product.name.toLowerCase().includes(query) ||
                    product.sku.toLowerCase().includes(query) ||
                    (product.barcode ?? '').toLowerCase().includes(query);
                const matchesCategory =
                    selectedCategoryId === null ||
                    product.category?.id === selectedCategoryId;

                return matchesSearch && matchesCategory;
            }),
        [products, searchQuery, selectedCategoryId],
    );

    const total = (quote?.total ?? 0) / 100;
    const paidTotal = payments.reduce(
        (sum, payment) => sum + (Number.parseFloat(payment.amount) || 0),
        0,
    );
    const change = paidTotal - total;

    function addToCart(product: PosProduct) {
        setCart((current) => {
            const existing = current.find(
                (item) => item.product.id === product.id,
            );

            if (existing) {
                return current.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                );
            }

            return [...current, { product, quantity: 1 }];
        });
        setScanError(null);
    }

    function updateQuantity(productId: number, quantity: number) {
        setCart((current) =>
            current
                .map((item) =>
                    item.product.id === productId
                        ? { ...item, quantity }
                        : item,
                )
                .filter((item) => item.quantity > 0),
        );
    }

    function removeFromCart(productId: number) {
        setCart((current) =>
            current.filter((item) => item.product.id !== productId),
        );
    }

    async function handleScan(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key !== 'Enter') {
            return;
        }

        event.preventDefault();
        const query = scanValue.trim();

        if (query === '') {
            return;
        }

        try {
            const result = await fetchJson<{ products: PosProduct[] }>(
                posSearch.url({
                    query: { store_id: storeId, query },
                }),
            );
            const scanned =
                result.products.find(
                    (product) =>
                        product.barcode === query || product.sku === query,
                ) ?? result.products[0];

            if (!scanned) {
                setScanError(`Barcode/SKU "${query}" tidak ditemukan.`);
            } else {
                addToCart(scanned);
                setScanValue('');
            }
        } catch (error) {
            setScanError(
                error instanceof Error
                    ? error.message
                    : 'Gagal mencari produk.',
            );
        }
    }

    function handleStoreChange(newStoreId: number) {
        setStoreId(newStoreId);
        setCart([]);
        router.get(
            posIndex.url(),
            { store_id: newStoreId },
            { preserveScroll: true, preserveState: false },
        );
    }

    function openCheckout() {
        if (cart.length === 0) {
            return;
        }

        setPayments([
            { method: 'cash', amount: total.toFixed(2), reference_number: '' },
        ]);
        setCheckoutOpen(true);
    }

    function updatePayment(index: number, values: Partial<PaymentRow>) {
        setPayments((current) =>
            current.map((payment, position) =>
                position === index ? { ...payment, ...values } : payment,
            ),
        );
    }

    function addPaymentRow() {
        const remaining = Math.max(0, total - paidTotal);
        setPayments((current) => [
            ...current,
            {
                method: 'debit',
                amount: remaining > 0 ? remaining.toFixed(2) : '',
                reference_number: '',
            },
        ]);
    }

    function removePaymentRow(index: number) {
        setPayments((current) =>
            current.length === 1
                ? current
                : current.filter((_, position) => position !== index),
        );
    }

    function handleCheckout() {
        if (paidTotal < total) {
            setActionError('Jumlah pembayaran masih kurang dari total.');
            return;
        }

        form.transform(() => ({
            store_id: storeId,
            items: cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
            payments,
            discount_amount: manualDiscount || '0',
            print_receipt: true,
            notes,
        }));
        form.post(transactionStore.url(), {
            preserveScroll: true,
            onSuccess: () => {
                setCart([]);
                setCheckoutOpen(false);
                setPayments([
                    {
                        method: 'cash',
                        amount: '',
                        reference_number: '',
                    },
                ]);
                setNotes('');
                setManualDiscount('0');
                setActionError(null);
            },
        });
    }

    function handleHold() {
        if (cart.length === 0) {
            return;
        }

        const label = window.prompt('Nama draft transaksi:', 'Pelanggan');
        if (!label) {
            return;
        }

        router.post(
            holdStore.url(),
            {
                store_id: storeId,
                label,
                items: cart.map((item) => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                })),
            },
            {
                preserveScroll: true,
                onSuccess: () => setCart([]),
            },
        );
    }

    function resumeHold(hold: PosHold) {
        setCart(
            hold.items.map((item) => ({
                product: item.product,
                quantity: item.quantity,
            })),
        );
    }

    function deleteHold(hold: PosHold) {
        router.delete(holdDestroy.url(hold.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Kasir (POS)" />
            <PageHeader
                title="Kasir (POS)"
                description="Scan barcode, hitung total otomatis, dan proses pembayaran."
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card className="space-y-4 p-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="store"
                                    className="mb-1 block text-xs font-medium text-foreground"
                                >
                                    Pilih Toko
                                </label>
                                <select
                                    id="store"
                                    value={storeId}
                                    onChange={(event) =>
                                        handleStoreChange(
                                            Number(event.target.value),
                                        )
                                    }
                                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                                >
                                    {stores.length === 0 && (
                                        <option value={0}>
                                            Tidak ada toko
                                        </option>
                                    )}
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label
                                    htmlFor="search"
                                    className="mb-1 block text-xs font-medium text-foreground"
                                >
                                    Cari Produk
                                </label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        id="search"
                                        type="text"
                                        placeholder="Nama, SKU, atau barcode"
                                        value={searchQuery}
                                        onChange={(event) =>
                                            setSearchQuery(event.target.value)
                                        }
                                        className="w-full rounded-md border border-border bg-background py-2 pr-3 pl-9 text-sm text-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="scanner"
                                className="mb-1 block text-xs font-medium text-foreground"
                            >
                                Scan Barcode
                            </label>
                            <div className="relative">
                                <ScanLine className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary" />
                                <input
                                    ref={scanRef}
                                    id="scanner"
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Fokus di sini lalu scan barcode atau ketik SKU + Enter"
                                    value={scanValue}
                                    onChange={(event) =>
                                        setScanValue(event.target.value)
                                    }
                                    onKeyDown={handleScan}
                                    className="w-full rounded-md border-2 border-primary/40 bg-background py-2.5 pr-3 pl-9 text-sm text-foreground"
                                />
                            </div>
                            {scanError && (
                                <p className="mt-1 text-xs text-danger-fg">
                                    {scanError}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedCategoryId(null)}
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-medium transition',
                                    selectedCategoryId === null
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                )}
                            >
                                Semua
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                        setSelectedCategoryId(category.id)
                                    }
                                    className={cn(
                                        'rounded-full px-3 py-1 text-xs font-medium transition',
                                        selectedCategoryId === category.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground hover:bg-muted/80',
                                    )}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4">
                        {filteredProducts.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                Tidak ada produk
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => addToCart(product)}
                                        className="group rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary hover:shadow-md"
                                    >
                                        <div className="mb-2 flex aspect-square items-center justify-center rounded-md bg-muted">
                                            <ShoppingCart className="h-8 w-8 text-muted-foreground/60" />
                                        </div>
                                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">
                                            {product.name}
                                        </h3>
                                        <p className="mb-1 text-xs text-muted-foreground">
                                            {product.sku}
                                        </p>
                                        <p className="text-base font-bold text-primary">
                                            {formatCurrency(product.price)}
                                        </p>
                                        <p
                                            className={cn(
                                                'mt-1 text-xs',
                                                product.stock <=
                                                    product.min_stock
                                                    ? 'text-danger-fg'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            Stok: {product.stock}{' '}
                                            {product.unit}
                                            {product.wholesale_price &&
                                                product.wholesale_min_qty && (
                                                    <span className="block text-[11px]">
                                                        Grosir &ge;{' '}
                                                        {
                                                            product.wholesale_min_qty
                                                        }{' '}
                                                        :{' '}
                                                        {formatCurrency(
                                                            product.wholesale_price,
                                                        )}
                                                    </span>
                                                )}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>

                    {holds.length > 0 && (
                        <Card className="p-4">
                            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Pause className="h-4 w-4" />
                                Draft Transaksi ({holds.length})
                            </h2>
                            <div className="space-y-2">
                                {holds.map((hold) => (
                                    <div
                                        key={hold.id}
                                        className="flex items-center justify-between gap-3 rounded-md border border-border p-2.5"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {hold.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {hold.items.length} produk
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => resumeHold(hold)}
                                                className={buttonClass(
                                                    'secondary',
                                                    'h-8 px-2.5 text-xs',
                                                )}
                                            >
                                                <Play className="h-3.5 w-3.5" />
                                                Lanjut
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteHold(hold)}
                                                className={buttonClass(
                                                    'danger',
                                                    'h-8 px-2.5 text-xs',
                                                )}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                <div>
                    <Card className="sticky top-4 p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground">
                                Keranjang
                            </h2>
                            {cart.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setCart([])}
                                    className="text-xs text-danger-fg hover:underline"
                                >
                                    Kosongkan
                                </button>
                            )}
                        </div>

                        {cart.length === 0 ? (
                            <div className="py-12 text-center">
                                <ShoppingCart className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">
                                    Keranjang kosong
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 max-h-[340px] space-y-3 overflow-y-auto pr-1">
                                    {cart.map((item) => {
                                        const lineQuote = quote?.items.find(
                                            (line) =>
                                                line.product_id ===
                                                item.product.id,
                                        );

                                        return (
                                            <div
                                                key={item.product.id}
                                                className="rounded-lg border border-border p-3"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
                                                            {item.product.name}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatCurrency(
                                                                item.product
                                                                    .price,
                                                            )}{' '}
                                                            /{' '}
                                                            {item.product.unit}
                                                        </p>
                                                        {lineQuote?.promotion_name && (
                                                            <p className="mt-1 text-xs font-medium text-primary">
                                                                {
                                                                    lineQuote.promotion_name
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFromCart(
                                                                item.product.id,
                                                            )
                                                        }
                                                        className="rounded-md p-1 text-danger-fg hover:bg-danger/10"
                                                        title="Void item"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.product.id,
                                                                item.quantity -
                                                                    1,
                                                            )
                                                        }
                                                        className="rounded-md border border-border p-1 hover:bg-muted"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={item.product.stock}
                                                        value={item.quantity}
                                                        onChange={(event) =>
                                                            updateQuantity(
                                                                item.product.id,
                                                                Math.max(
                                                                    1,
                                                                    Number(
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    ),
                                                                ),
                                                            )
                                                        }
                                                        className="w-14 rounded-md border border-border bg-background px-2 py-1 text-center text-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.product.id,
                                                                item.quantity +
                                                                    1,
                                                            )
                                                        }
                                                        className="rounded-md border border-border p-1 hover:bg-muted"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                    <span className="ml-auto text-sm font-semibold text-foreground">
                                                        {formatCurrency(
                                                            lineQuote
                                                                ? lineQuote.subtotal /
                                                                      100
                                                                : (Number.parseFloat(
                                                                      item.product
                                                                          .price,
                                                                  ) || 0) *
                                                                      item
                                                                          .quantity,
                                                        )}
                                                    </span>
                                                </div>
                                                {item.quantity >
                                                    item.product.stock && (
                                                    <p className="mt-1 text-xs text-danger-fg">
                                                        Melebihi stok tersedia (
                                                        {item.product.stock})
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2 border-t border-border pt-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                quote
                                                    ? quote.subtotal / 100
                                                    : 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <label
                                            htmlFor="manual-discount"
                                            className="text-muted-foreground"
                                        >
                                            Diskon
                                        </label>
                                        <input
                                            id="manual-discount"
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            value={manualDiscount}
                                            onChange={(event) =>
                                                setManualDiscount(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-28 rounded-md border border-border bg-background px-2 py-1 text-right text-sm"
                                        />
                                    </div>
                                    {quote && quote.discount > 0 && (
                                        <div className="flex items-center justify-between text-primary">
                                            <span>
                                                Total diskon
                                                {quote.promotion_names.length >
                                                    0 &&
                                                    ` (${quote.promotion_names.join(', ')})`}
                                            </span>
                                            <span>
                                                -
                                                {formatCurrency(
                                                    quote.discount / 100,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">
                                            Pajak ({quote?.tax_percentage ?? taxPercentage}
                                            %)
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(
                                                (quote?.tax ?? 0) / 100,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border pt-2 text-base font-bold">
                                        <span>Total</span>
                                        <span className="text-primary">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                    {quoteError && (
                                        <p className="text-xs text-danger-fg">
                                            {quoteError}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2">
                                    <button
                                        type="button"
                                        onClick={openCheckout}
                                        disabled={cart.length === 0}
                                        className={buttonClass(
                                            'primary',
                                            'w-full py-3 text-base',
                                        )}
                                    >
                                        <CreditCard className="h-5 w-5" />
                                        Bayar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleHold}
                                        className={buttonClass(
                                            'secondary',
                                            'w-full',
                                        )}
                                    >
                                        <Pause className="h-4 w-4" />
                                        Simpan Draft
                                    </button>
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>

            {checkoutOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="checkout-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
                >
                    <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-card p-6 shadow-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2
                                    id="checkout-title"
                                    className="text-lg font-semibold text-foreground"
                                >
                                    Pembayaran
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Total tagihan:{' '}
                                    <strong className="text-foreground">
                                        {formatCurrency(total)}
                                    </strong>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCheckoutOpen(false)}
                                className="rounded-md p-1 text-muted-foreground hover:bg-muted"
                                aria-label="Tutup"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            {payments.map((payment, index) => {
                                const config =
                                    PAYMENT_METHODS.find(
                                        (method) =>
                                            method.value === payment.method,
                                    ) ?? PAYMENT_METHODS[0];
                                const Icon = config.icon;

                                return (
                                    <div
                                        key={index}
                                        className="rounded-lg border border-border p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4 text-primary" />
                                            <select
                                                value={payment.method}
                                                onChange={(event) =>
                                                    updatePayment(index, {
                                                        method: event.target
                                                            .value,
                                                    })
                                                }
                                                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                                            >
                                                {PAYMENT_METHODS.map(
                                                    (method) => (
                                                        <option
                                                            key={method.value}
                                                            value={method.value}
                                                        >
                                                            {method.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            {payments.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removePaymentRow(index)
                                                    }
                                                    className="rounded-md p-1 text-danger-fg hover:bg-danger/10"
                                                    aria-label="Hapus pembayaran"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={payment.amount}
                                                onChange={(event) =>
                                                    updatePayment(index, {
                                                        amount: event.target
                                                            .value,
                                                    })
                                                }
                                                placeholder="Jumlah"
                                                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updatePayment(index, {
                                                        amount: Math.max(
                                                            0,
                                                            total -
                                                                (paidTotal -
                                                                    (Number.parseFloat(
                                                                        payment.amount,
                                                                    ) || 0)),
                                                        ).toFixed(2),
                                                    })
                                                }
                                                className={buttonClass(
                                                    'secondary',
                                                    'shrink-0 px-2.5 text-xs',
                                                )}
                                            >
                                                Uang pas
                                            </button>
                                        </div>
                                        {payment.method !== 'cash' && (
                                            <input
                                                type="text"
                                                value={payment.reference_number}
                                                onChange={(event) =>
                                                    updatePayment(index, {
                                                        reference_number:
                                                            event.target.value,
                                                    })
                                                }
                                                placeholder="No. referensi / approval (opsional)"
                                                className="mt-2 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                                            />
                                        )}
                                    </div>
                                );
                            })}

                            <button
                                type="button"
                                onClick={addPaymentRow}
                                className={buttonClass(
                                    'secondary',
                                    'w-full text-xs',
                                )}
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Tambah Metode (Split Payment)
                            </button>
                        </div>

                        <div className="mt-4 space-y-2 rounded-lg bg-muted p-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Total
                                </span>
                                <span className="font-semibold">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Dibayar
                                </span>
                                <span className="font-semibold">
                                    {formatCurrency(paidTotal)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {change < 0 ? 'Kurang' : 'Kembalian'}
                                </span>
                                <span
                                    className={cn(
                                        'font-bold',
                                        change < 0
                                            ? 'text-danger-fg'
                                            : 'text-primary',
                                    )}
                                >
                                    {formatCurrency(Math.abs(change))}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3">
                            <label
                                htmlFor="checkout-notes"
                                className="mb-1 block text-xs font-medium text-foreground"
                            >
                                Catatan (opsional)
                            </label>
                            <input
                                id="checkout-notes"
                                type="text"
                                value={notes}
                                onChange={(event) =>
                                    setNotes(event.target.value)
                                }
                                placeholder="Contoh: pelanggan member"
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                        </div>

                        {(actionError ||
                            form.errors.payments ||
                            form.errors.items ||
                            form.errors.store_id ||
                            form.errors.discount_amount) && (
                            <p className="mt-2 text-xs text-danger-fg">
                                {actionError ??
                                    form.errors.payments ??
                                    form.errors.items ??
                                    form.errors.store_id ??
                                    form.errors.discount_amount}
                            </p>
                        )}

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setCheckoutOpen(false)}
                                className={buttonClass('secondary')}
                                disabled={form.processing}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={form.processing || paidTotal < total}
                                className={buttonClass('primary')}
                            >
                                <Printer className="h-4 w-4" />
                                {form.processing
                                    ? 'Memproses...'
                                    : 'Bayar & Cetak Struk'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

PosIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default PosIndex;
