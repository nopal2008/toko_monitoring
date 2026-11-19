import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import AreaController from '@/actions/App/Http/Controllers/AreaController';
import { CheckboxField, TextField, TextareaField } from '@/components/fields';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import type { Area } from '@/types/models';

function AreasForm({ area }: { area?: Area }) {
    const editing = area !== undefined;
    const form = useForm({
        name: area?.name ?? '',
        code: area?.code ?? '',
        description: area?.description ?? '',
        is_active: area?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        if (area) {
            form.put(AreaController.update.url(area.id));
        } else {
            form.post(AreaController.store.url());
        }
    }

    return (
        <>
            <Head title={editing ? 'Ubah area' : 'Tambah area'} />
            <PageHeader
                title={editing ? 'Ubah area' : 'Tambah area'}
                description="Kelola area wilayah untuk mengelompokkan cabang toko."
            />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <TextField
                        id="name"
                        label="Nama area"
                        required
                        maxLength={255}
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                    />
                    <TextField
                        id="code"
                        label="Kode area"
                        required
                        maxLength={50}
                        placeholder="Contoh: JKT, BDG, SBY"
                        value={form.data.code}
                        onChange={(e) =>
                            form.setData(
                                'code',
                                e.target.value.toUpperCase(),
                            )
                        }
                        error={form.errors.code}
                    />
                    <TextareaField
                        id="description"
                        label="Deskripsi"
                        rows={3}
                        maxLength={5000}
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                        error={form.errors.description}
                    />
                    <CheckboxField
                        id="is_active"
                        label="Area aktif"
                        checked={form.data.is_active}
                        onChange={(e) =>
                            form.setData('is_active', e.target.checked)
                        }
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link
                        href={AreaController.index.url()}
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

AreasForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default AreasForm;
