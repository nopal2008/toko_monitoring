import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import { CheckboxField, TextField } from '@/components/fields';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import type { Category } from '@/types/models';

function CategoriesForm({ category }: { category?: Category }) {
    const editing = category !== undefined;
    const form = useForm({
        name: category?.name ?? '',
        is_active: category?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        if (category) {
            form.put(CategoryController.update.url(category.id));
        } else {
            form.post(CategoryController.store.url());
        }
    }

    return (
        <>
            <Head title={editing ? 'Ubah kategori' : 'Tambah kategori'} />
            <PageHeader
                title={editing ? 'Ubah kategori' : 'Tambah kategori'}
                description="Nama kategori harus unik."
            />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <TextField
                        id="name"
                        label="Nama kategori"
                        required
                        maxLength={255}
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                    />
                    <CheckboxField
                        id="is_active"
                        label="Kategori aktif"
                        checked={form.data.is_active}
                        onChange={(e) =>
                            form.setData('is_active', e.target.checked)
                        }
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link
                        href={CategoryController.index.url()}
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

CategoriesForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default CategoriesForm;
