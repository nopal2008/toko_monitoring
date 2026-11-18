import { Head, router, useForm } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Minus, Plus, Search, ShoppingCart, Trash2, X } from 'lucide-react';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CategoryOption, Product, Store } from '@/types/models';
import { store as transactionStore } from '@/routes/transactions';
import { index as posIndex } from '@/routes/pos';

type CartItem = {
    product: Product;
    quantity: number;
    price: string;
};

type Props = {
    products: Product[];
    stores: Store[];
    categories: CategoryOption[];
    selectedStoreId: number;
};

function PosIndex({ products, stores, categories, selectedStoreId }: Props) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [storeId, setStoreId] = useState(selectedStoreId);

    const form = useForm({
        store_id: storeId,
        items: [] as Array<{ product_id: number; quantity: number; price: string }>,
        payment_method: 'cash',
        paid_amount: '0',
    });

    const addToCart = (product: Product) => {
        const existingItem = cart.find((item) => item.product.id === product.id);

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart([
                ...cart,
                {
                    product,
                    quantity: 1,
                    price: product.base_price,
                },
            ]);
        }
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.product.id === productId
                        ? { ...item, quantity: item.quantity + delta }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const total = cart.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
    );

    const handleStoreChange = (newStoreId: number) => {
        setStoreId(newStoreId);
        router.get(
            posIndex.url(),
            { store_id: newStoreId },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCategoryFilter = (categoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        router.get(
            posIndex.url(),
            {
                store_id: storeId,
                ...(categoryId ? { category_id: categoryId } : {}),
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        router.get(
            posIndex.url(),
            {
                store_id: storeId,
                ...(query ? { search: query } : {}),
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            alert('Keranjang kosong!');
            return;
        }

        if (storeId === 0) {
            alert('Pilih toko terlebih dahulu!');
            return;
        }

        const paidAmount = prompt('Jumlah yang dibayar:', total.toString());
        if (!paidAmount) return;

        form.setData({
            store_id: storeId,
            items: cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.price,
            })),
            payment_method: 'cash',
            paid_amount: paidAmount,
        });

        form.post(transactionStore.url(), {
            onSuccess: () => {
                clearCart();
                alert('Transaksi berhasil!');
            },
        });
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            searchQuery === '' ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
            selectedCategoryId === null || product.category?.id === selectedCategoryId;

        return matchesSearch && matchesCategory;
    });

    return (
        <>
            <Head title="Kasir (POS)" />
            <PageHeader title="Kasir (POS)" description="Sistem Point of Sale untuk transaksi penjualan." />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product List */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Store & Search */}
                    <Card className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="store" className="mb-1 block text-xs font-medium text-slate-700">
                                    Pilih Toko
                                </label>
                                <select
                                    id="store"
                                    value={storeId}
                                    onChange={(e) => handleStoreChange(Number(e.target.value))}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                >
                                    {stores.length === 0 && <option value={0}>Tidak ada toko</option>}
                                    {stores.map((store) => (
                                        <option key={store.id} value={store.id}>
                                            {store.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="search" className="mb-1 block text-xs font-medium text-slate-700">
                                    Cari Produk
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        id="search"
                                        placeholder="Nama atau SKU"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleCategoryFilter(null)}
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-medium transition',
                                    selectedCategoryId === null
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                )}
                            >
                                Semua
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryFilter(category.id)}
                                    className={cn(
                                        'rounded-full px-3 py-1 text-xs font-medium transition',
                                        selectedCategoryId === category.id
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    )}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Products Grid */}
                    <Card className="p-4">
                        {filteredProducts.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-slate-500">Tidak ada produk</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="group relative rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-500 hover:shadow-md"
                                    >
                                        <div className="aspect-square rounded-md bg-slate-100 mb-2 flex items-center justify-center overflow-hidden">
                                            {product.image_path ? (
                                                <img
                                                    src={product.image_path}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ShoppingCart className="h-8 w-8 text-slate-300" />
                                            )}
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 mb-2">{product.sku}</p>
                                        <p className="text-base font-bold text-emerald-600">
                                            {formatCurrency(product.base_price)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Cart */}
                <div className="lg:col-span-1">
                    <Card className="p-4 sticky top-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Keranjang</h2>
                            {cart.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    className="text-xs text-rose-600 hover:text-rose-700"
                                >
                                    Kosongkan
                                </button>
                            )}
                        </div>

                        {cart.length === 0 ? (
                            <div className="py-12 text-center">
                                <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                <p className="text-sm text-slate-500">Keranjang kosong</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                                    {cart.map((item) => (
                                        <div
                                            key={item.product.id}
                                            className="flex gap-3 rounded-lg border border-slate-200 p-3"
                                        >
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                                                    {item.product.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 mb-2">
                                                    {formatCurrency(item.price)} × {item.quantity}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, -1)}
                                                        className="rounded-md border border-slate-300 p-1 hover:bg-slate-50"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, 1)}
                                                        className="rounded-md border border-slate-300 p-1 hover:bg-slate-50"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromCart(item.product.id)}
                                                        className="ml-auto rounded-md p-1 text-rose-600 hover:bg-rose-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-slate-200 pt-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-600">Total Item:</span>
                                        <span className="text-sm font-semibold text-slate-900">
                                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-slate-900">Total:</span>
                                        <span className="text-2xl font-bold text-emerald-600">
                                            {formatCurrency(total.toString())}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={form.processing}
                                        className={buttonClass('primary', 'w-full py-3 text-base')}
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        <span>{form.processing ? 'Memproses...' : 'Checkout'}</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}

PosIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default PosIndex;
