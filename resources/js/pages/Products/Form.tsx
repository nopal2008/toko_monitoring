import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import {
    CheckboxField,
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/fields';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import type { CategoryOption, Product } from '@/types/models';

type StoreOption = { id: number; name: string };

type StoreLinkInput = {
    store_id: number;
    price: string;
    wholesale_price: string;
    wholesale_min_qty: string;
    min_stock: string;
    is_available: boolean;
};

function ProductsForm({
    product,
    categories,
    stores = [],
}: {
    product?: Product;
    categories: CategoryOption[];
    stores?: StoreOption[];
}) {
    const editing = product !== undefined;
    const storeLinks: StoreLinkInput[] = stores.map((store) => {
        const existing = product?.stores?.find((item) => item.id === store.id);

        return {
            store_id: store.id,
            price: existing?.pivot.price ?? '',
            wholesale_price: existing?.pivot.wholesale_price ?? '',
            wholesale_min_qty: existing?.pivot.wholesale_min_qty
                ? String(existing.pivot.wholesale_min_qty)
                : '',
            min_stock: existing?.pivot.min_stock
                ? String(existing.pivot.min_stock)
                : '',
            is_available: Boolean(existing?.pivot.is_available),
        };
    });
    const form = useForm({
        category_id: product?.category_id ? String(product.category_id) : '',
        name: product?.name ?? '',
        sku: product?.sku ?? '',
        barcode: product?.barcode ?? '',
        unit: product?.unit ?? 'pcs',
        description: product?.description ?? '',
        base_price: product?.base_price ?? '',
        cost_price: product?.cost_price ?? '',
        is_active: product?.is_active ?? true,
        stores: storeLinks,
    });

    function updateStoreLink(
        storeId: number,
        values: Partial<StoreLinkInput>,
    ) {
        form.setData(
            'stores',
            form.data.stores.map((link) =>
                link.store_id === storeId ? { ...link, ...values } : link,
            ),
        );
    }

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        form.transform((data) => ({
            ...data,
            stores: data.stores
                .filter((link) => link.is_available)
                .map((link) => ({
                    store_id: link.store_id,
                    price: link.price === '' ? null : link.price,
                    wholesale_price:
                        link.wholesale_price === ''
                            ? null
                            : link.wholesale_price,
                    wholesale_min_qty:
                        link.wholesale_min_qty === ''
                            ? null
                            : Number(link.wholesale_min_qty),
                    min_stock:
                        link.min_stock === '' ? null : Number(link.min_stock),
                    is_available: true,
                })),
        }));

        if (product) {
            form.put(ProductController.update.url(product.id));
        } else {
            form.post(ProductController.store.url());
        }
    }

    const text = (
        key: 'name' | 'sku' | 'barcode' | 'unit' | 'description',
    ) => ({
        value: form.data[key],
        onChange: (e: { target: { value: string } }) =>
            form.setData(key, e.target.value),
        error: form.errors[key],
    });

    return (
        <>
            <Head title={editing ? 'Ubah produk' : 'Tambah produk'} />
            <PageHeader
                title={editing ? 'Ubah produk' : 'Tambah produk'}
                description="SKU harus unik."
            />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            id="name"
                            label="Nama produk"
                            required
                            maxLength={255}
                            {...text('name')}
                        />
                        <TextField
                            id="sku"
                            label="SKU"
                            required
                            maxLength={100}
                            {...text('sku')}
                        />
                        <TextField
                            id="barcode"
                            label="Barcode"
                            maxLength={100}
                            {...text('barcode')}
                        />
                        <TextField
                            id="unit"
                            label="Satuan"
                            required
                            maxLength={20}
                            {...text('unit')}
                        />
                        <SelectField
                            id="category_id"
                            label="Kategori"
                            value={form.data.category_id}
                            onChange={(e) =>
                                form.setData('category_id', e.target.value)
                            }
                            error={form.errors.category_id}
                        >
                            <option value="">Tanpa kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </SelectField>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            id="base_price"
                            label="Harga jual (Rp)"
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.01"
                            required
                            value={form.data.base_price}
                            onChange={(e) =>
                                form.setData('base_price', e.target.value)
                            }
                            error={form.errors.base_price}
                        />
                        <TextField
                            id="cost_price"
                            label="Harga modal (Rp)"
                            type="number"
                            inputMode="decimal"
                            min={0}
                            step="0.01"
                            required
                            value={form.data.cost_price}
                            onChange={(e) =>
                                form.setData('cost_price', e.target.value)
                            }
                            error={form.errors.cost_price}
                        />
                    </div>
                    <div className="space-y-3 rounded-lg border border-border p-4">
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Harga per Cabang
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Aktifkan cabang untuk menjual produk ini. Harga
                                grosir otomatis dipakai saat jumlah beli
                                mencapai batas minimum.
                            </p>
                        </div>
                        {form.data.stores.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada cabang aktif.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {form.data.stores.map((link) => {
                                    const store = stores.find(
                                        (item) => item.id === link.store_id,
                                    );

                                    return (
                                        <div
                                            key={link.store_id}
                                            className="rounded-md border border-border p-3"
                                        >
                                            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                                <input
                                                    type="checkbox"
                                                    checked={link.is_available}
                                                    onChange={(event) =>
                                                        updateStoreLink(
                                                            link.store_id,
                                                            {
                                                                is_available:
                                                                    event.target
                                                                        .checked,
                                                            },
                                                        )
                                                    }
                                                    className="size-4 rounded border-border"
                                                />
                                                {store?.name ?? '-'}
                                            </label>
                                            {link.is_available && (
                                                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                                                    <TextField
                                                        id={`store-${link.store_id}-price`}
                                                        label="Harga jual"
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={link.price}
                                                        onChange={(event) =>
                                                            updateStoreLink(
                                                                link.store_id,
                                                                {
                                                                    price: event
                                                                        .target
                                                                        .value,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <TextField
                                                        id={`store-${link.store_id}-wholesale`}
                                                        label="Harga grosir"
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={
                                                            link.wholesale_price
                                                        }
                                                        onChange={(event) =>
                                                            updateStoreLink(
                                                                link.store_id,
                                                                {
                                                                    wholesale_price:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <TextField
                                                        id={`store-${link.store_id}-wholesale-qty`}
                                                        label="Min. qty grosir"
                                                        type="number"
                                                        min={1}
                                                        value={
                                                            link.wholesale_min_qty
                                                        }
                                                        onChange={(event) =>
                                                            updateStoreLink(
                                                                link.store_id,
                                                                {
                                                                    wholesale_min_qty:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <TextField
                                                        id={`store-${link.store_id}-min-stock`}
                                                        label="Min. stok"
                                                        type="number"
                                                        min={0}
                                                        value={link.min_stock}
                                                        onChange={(event) =>
                                                            updateStoreLink(
                                                                link.store_id,
                                                                {
                                                                    min_stock:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                },
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <TextAreaField
                        id="description"
                        label="Deskripsi"
                        maxLength={5000}
                        {...text('description')}
                    />
                    <CheckboxField
                        id="is_active"
                        label="Produk aktif"
                        checked={form.data.is_active}
                        onChange={(e) =>
                            form.setData('is_active', e.target.checked)
                        }
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link
                        href={ProductController.index.url()}
                        className={buttonClass('secondary')}
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={form.processing}
                        className={buttonClass('primary')}
                    >
                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </>
    );
}

ProductsForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ProductsForm;
