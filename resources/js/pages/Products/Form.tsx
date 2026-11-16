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

// Penautan produk ke cabang (`stores.*`) belum diedit di form ini karena
// controller tidak mengirim daftar cabang ke Products/Form. Saat `stores`
// tidak dikirim, backend mempertahankan tautan yang sudah ada.
function ProductsForm({
    product,
    categories,
}: {
    product?: Product;
    categories: CategoryOption[];
}) {
    const editing = product !== undefined;
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
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        if (product) {
            form.put(ProductController.update.url(product.id));
        } else {
            form.post(ProductController.store.url());
        }
    }

    const text = (key: 'name' | 'sku' | 'barcode' | 'unit' | 'description') => ({
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
                        <TextField id="name" label="Nama produk" required maxLength={255} {...text('name')} />
                        <TextField id="sku" label="SKU" required maxLength={100} {...text('sku')} />
                        <TextField id="barcode" label="Barcode" maxLength={100} {...text('barcode')} />
                        <TextField id="unit" label="Satuan" required maxLength={20} {...text('unit')} />
                        <SelectField
                            id="category_id"
                            label="Kategori"
                            value={form.data.category_id}
                            onChange={(e) => form.setData('category_id', e.target.value)}
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
                            onChange={(e) => form.setData('base_price', e.target.value)}
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
                            onChange={(e) => form.setData('cost_price', e.target.value)}
                            error={form.errors.cost_price}
                        />
                    </div>
                    <TextAreaField id="description" label="Deskripsi" maxLength={5000} {...text('description')} />
                    <CheckboxField
                        id="is_active"
                        label="Produk aktif"
                        checked={form.data.is_active}
                        onChange={(e) => form.setData('is_active', e.target.checked)}
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link href={ProductController.index.url()} className={buttonClass('secondary')}>
                        Batal
                    </Link>
                    <button type="submit" disabled={form.processing} className={buttonClass('primary')}>
                        {form.processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </>
    );
}

ProductsForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ProductsForm;
