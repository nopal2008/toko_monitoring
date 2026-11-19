import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import BrandController from '@/actions/App/Http/Controllers/BrandController';
import { CheckboxField, TextField } from '@/components/fields';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import type { Brand } from '@/types/models';

function BrandsForm({ brand }: { brand?: Brand }) {
    const editing = brand !== undefined;
    const form = useForm({
        name: brand?.name ?? '',
        slug: brand?.slug ?? '',
        is_active: brand?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        if (brand) {
            form.put(BrandController.update.url(brand.id));
        } else {
            form.post(BrandController.store.url());
        }
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    return (
        <>
            <Head title={editing ? 'Ubah merek' : 'Tambah merek'} />
            <PageHeader
                title={editing ? 'Ubah merek' : 'Tambah merek'}
                description="Kelola merek produk untuk memudahkan identifikasi."
            />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <TextField
                        id="name"
                        label="Nama merek"
                        required
                        maxLength={255}
                        value={form.data.name}
                        onChange={(e) => {
                            const name = e.target.value;
                            form.setData({
                                name,
                                slug: generateSlug(name),
                                is_active: form.data.is_active,
                            });
                        }}
                        error={form.errors.name}
                    />
                    <TextField
                        id="slug"
                        label="Slug"
                        required
                        maxLength={255}
                        placeholder="nama-merek"
                        value={form.data.slug}
                        onChange={(e) => form.setData('slug', e.target.value)}
                        error={form.errors.slug}
                        helpText="URL-friendly identifier (otomatis dari nama)"
                    />
                    <CheckboxField
                        id="is_active"
                        label="Merek aktif"
                        checked={form.data.is_active}
                        onChange={(e) =>
                            form.setData('is_active', e.target.checked)
                        }
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link
                        href={BrandController.index.url()}
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

BrandsForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default BrandsForm;
