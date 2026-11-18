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

    return (
        <>
            <Head title={editing ? 'Ubah merek' : 'Tambah merek'} />
            <PageHeader title={editing ? 'Ubah merek' : 'Tambah merek'} description="Nama dan slug merek." />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <TextField
                        id="name"
                        label="Nama merek"
                        required
                        maxLength={255}
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                    />
                    <TextField
                        id="slug"
                        label="Slug"
                        required
                        maxLength={255}
                        value={form.data.slug}
                        onChange={(e) => form.setData('slug', e.target.value)}
                        error={form.errors.slug}
                    />
                    <CheckboxField
                        id="is_active"
                        label="Merek aktif"
                        checked={form.data.is_active}
                        onChange={(e) => form.setData('is_active', e.target.checked)}
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link href={BrandController.index.url()} className={buttonClass('secondary')}>
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

BrandsForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default BrandsForm;
