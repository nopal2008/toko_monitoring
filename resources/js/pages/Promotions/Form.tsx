import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import PromotionController from '@/actions/App/Http/Controllers/PromotionController';
import { CheckboxField, SelectField, TextField } from '@/components/fields';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import type { Promotion } from '@/types/models';

type StoreOption = { id: number; name: string };
type ProductOption = { id: number; name: string; sku: string };

function toInputDateTime(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    return value.slice(0, 16);
}

function PromotionsForm({
    promotion,
    stores = [],
    products = [],
}: {
    promotion?: Promotion;
    stores?: StoreOption[];
    products?: ProductOption[];
}) {
    const editing = promotion !== undefined;
    const form = useForm({
        name: promotion?.name ?? '',
        type: promotion?.type ?? 'percent',
        value: promotion?.value ?? '0',
        buy_quantity: promotion?.buy_quantity
            ? String(promotion.buy_quantity)
            : '1',
        free_quantity: promotion?.free_quantity
            ? String(promotion.free_quantity)
            : '1',
        min_purchase: promotion?.min_purchase ?? '0',
        store_id: promotion?.store_id ? String(promotion.store_id) : '',
        product_id: promotion?.product_id
            ? String(promotion.product_id)
            : '',
        starts_at: toInputDateTime(promotion?.starts_at),
        ends_at: toInputDateTime(promotion?.ends_at),
        is_active: promotion?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        const options = { preserveScroll: true };

        if (promotion) {
            form.put(PromotionController.update.url(promotion.id), options);
        } else {
            form.post(PromotionController.store.url(), options);
        }
    }

    return (
        <>
            <Head title={editing ? 'Ubah promosi' : 'Tambah promosi'} />
            <PageHeader
                title={editing ? 'Ubah promosi' : 'Tambah promosi'}
                description="Promosi otomatis diterapkan saat kasir menghitung total."
            />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <TextField
                            id="name"
                            label="Nama promosi"
                            required
                            maxLength={255}
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            error={form.errors.name}
                        />
                        <SelectField
                            id="type"
                            label="Jenis promosi"
                            required
                            value={form.data.type}
                            onChange={(event) =>
                                form.setData(
                                    'type',
                                    event.target.value as Promotion['type'],
                                )
                            }
                            error={form.errors.type}
                        >
                            <option value="percent">Diskon persen</option>
                            <option value="fixed">Potongan nominal</option>
                            <option value="bogo">Beli X gratis Y</option>
                        </SelectField>
                    </div>

                    {form.data.type === 'bogo' ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <TextField
                                id="buy_quantity"
                                label="Jumlah dibeli"
                                type="number"
                                min={1}
                                required
                                value={form.data.buy_quantity}
                                onChange={(event) =>
                                    form.setData(
                                        'buy_quantity',
                                        event.target.value,
                                    )
                                }
                                error={form.errors.buy_quantity}
                            />
                            <TextField
                                id="free_quantity"
                                label="Jumlah gratis"
                                type="number"
                                min={1}
                                required
                                value={form.data.free_quantity}
                                onChange={(event) =>
                                    form.setData(
                                        'free_quantity',
                                        event.target.value,
                                    )
                                }
                                error={form.errors.free_quantity}
                            />
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            <TextField
                                id="value"
                                label={
                                    form.data.type === 'percent'
                                        ? 'Nilai diskon (%)'
                                        : 'Potongan (Rp)'
                                }
                                type="number"
                                min={0}
                                step="0.01"
                                required
                                value={form.data.value}
                                onChange={(event) =>
                                    form.setData('value', event.target.value)
                                }
                                error={form.errors.value}
                            />
                            <TextField
                                id="min_purchase"
                                label="Minimal belanja (Rp)"
                                type="number"
                                min={0}
                                step="0.01"
                                hint="Isi 0 bila tanpa minimal belanja."
                                value={form.data.min_purchase}
                                onChange={(event) =>
                                    form.setData(
                                        'min_purchase',
                                        event.target.value,
                                    )
                                }
                                error={form.errors.min_purchase}
                            />
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <SelectField
                            id="store_id"
                            label="Cabang"
                            value={form.data.store_id}
                            onChange={(event) =>
                                form.setData('store_id', event.target.value)
                            }
                            error={form.errors.store_id}
                        >
                            <option value="">Semua cabang</option>
                            {stores.map((store) => (
                                <option key={store.id} value={store.id}>
                                    {store.name}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            id="product_id"
                            label="Produk"
                            hint="Kosongkan untuk promo tingkat transaksi."
                            value={form.data.product_id}
                            onChange={(event) =>
                                form.setData('product_id', event.target.value)
                            }
                            error={form.errors.product_id}
                        >
                            <option value="">Semua produk</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <TextField
                            id="starts_at"
                            label="Mulai"
                            type="datetime-local"
                            value={form.data.starts_at}
                            onChange={(event) =>
                                form.setData('starts_at', event.target.value)
                            }
                            error={form.errors.starts_at}
                        />
                        <TextField
                            id="ends_at"
                            label="Berakhir"
                            type="datetime-local"
                            value={form.data.ends_at}
                            onChange={(event) =>
                                form.setData('ends_at', event.target.value)
                            }
                            error={form.errors.ends_at}
                        />
                    </div>

                    <CheckboxField
                        id="is_active"
                        label="Promosi aktif"
                        checked={form.data.is_active}
                        onChange={(event) =>
                            form.setData('is_active', event.target.checked)
                        }
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link
                        href={PromotionController.index.url()}
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

PromotionsForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default PromotionsForm;
