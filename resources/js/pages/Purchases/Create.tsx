import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Card, PageHeader, buttonClass } from '@/components/ui';
import PurchaseController from '@/actions/App/Http/Controllers/PurchaseController';
import AppLayout from '@/layouts/app-layout';
import { useAuth } from '@/hooks/use-auth';
import type { Product, Store, Supplier } from '@/types/models';

type PurchaseItemRow = {
    product_id: number;
    quantity: number;
    unit_cost: string;
};

function PurchasesCreate({
    stores,
    suppliers,
    products,
}: {
    stores: Store[];
    suppliers: Supplier[];
    products: Product[];
}) {
    const { can } = useAuth();
    const defaultStoreId = stores[0]?.id ?? 0;
    const [storeId, setStoreId] = useState<number>(defaultStoreId);
    const [supplierId, setSupplierId] = useState<number | null>(null);
    const [purchaseDate, setPurchaseDate] = useState(
        () => new Date().toISOString().split('T')[0],
    );
    const [status, setStatus] = useState<'draft' | 'completed'>('draft');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<PurchaseItemRow[]>([
        { product_id: 0, quantity: 1, unit_cost: '0' },
    ]);

    function updateItem(index: number, patch: Partial<PurchaseItemRow>) {
        setItems((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index ? { ...item, ...patch } : item,
            ),
        );
    }

    function addItem() {
        setItems((current) => [
            ...current,
            { product_id: 0, quantity: 1, unit_cost: '0' },
        ]);
    }

    function removeItem(index: number) {
        setItems((current) =>
            current.filter((_, itemIndex) => itemIndex !== index),
        );
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            store_id: storeId,
            supplier_id: supplierId,
            purchase_date: purchaseDate,
            status,
            notes: notes || null,
            items: items
                .filter((item) => item.product_id > 0)
                .map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_cost: item.unit_cost,
                })),
        };

        router.post(PurchaseController.store.url(), payload, {
            onSuccess: () => router.visit(PurchaseController.index.url()),
        });
    }

    return (
        <>
            <Head title="Pembelian Baru" />
            <PageHeader
                title="Pembelian Baru"
                description="Catat pesanan pembelian ke supplier."
            />
            <form onSubmit={submit}>
                <Card className="mb-6 p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="store_id"
                                className="mb-1 block text-sm font-medium text-foreground"
                            >
                                Toko
                            </label>
                            <select
                                id="store_id"
                                value={storeId}
                                onChange={(e) => setStoreId(Number(e.target.value))}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                                {stores.map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="supplier_id"
                                className="mb-1 block text-sm font-medium text-foreground"
                            >
                                Supplier
                            </label>
                            <select
                                id="supplier_id"
                                value={supplierId ?? ''}
                                onChange={(e) =>
                                    setSupplierId(
                                        e.target.value === '' ? null : Number(e.target.value),
                                    )
                                }
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                                <option value="">Tanpa Supplier</option>
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label
                                htmlFor="purchase_date"
                                className="mb-1 block text-sm font-medium text-foreground"
                            >
                                Tanggal Pembelian
                            </label>
                            <input
                                id="purchase_date"
                                type="date"
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="status"
                                className="mb-1 block text-sm font-medium text-foreground"
                            >
                                Status
                            </label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value as 'draft' | 'completed')
                                }
                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            >
                                <option value="draft">Draf</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label
                            htmlFor="notes"
                            className="mb-1 block text-sm font-medium text-foreground"
                        >
                            Catatan
                        </label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                            rows={3}
                        />
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Item Pembelian</h2>
                        <button
                            type="button"
                            onClick={addItem}
                            className={buttonClass('secondary', 'h-9 px-3')}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Item</span>
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[42rem] text-sm">
                            <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Produk
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Kuantitas
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Harga Satuan
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium">
                                        Subtotal
                                    </th>
                                    <th scope="col" className="px-4 py-3 font-medium" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3">
                                            <select
                                                aria-label={`Produk item ${index + 1}`}
                                                value={item.product_id}
                                                onChange={(e) =>
                                                    updateItem(index, {
                                                        product_id: Number(e.target.value),
                                                    })
                                                }
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                            >
                                                <option value={0}>Pilih Produk</option>
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min={1}
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(index, {
                                                        quantity: Number(e.target.value) || 0,
                                                    })
                                                }
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={item.unit_cost}
                                                onChange={(e) =>
                                                    updateItem(index, {
                                                        unit_cost: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {Number(item.quantity) * Number(item.unit_cost || 0)
                                                ?.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className={buttonClass('secondary', 'h-8 px-2.5 text-xs')}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span>Hapus</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className={buttonClass('primary')}
                            disabled={items.filter((item) => item.product_id > 0).length === 0}
                        >
                            Simpan Pembelian
                        </button>
                    </div>
                </Card>
            </form>
        </>
    );
}

PurchasesCreate.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default PurchasesCreate;
