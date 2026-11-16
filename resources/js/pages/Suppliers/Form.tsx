import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import { CheckboxField, TextAreaField, TextField } from '@/components/fields';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import type { Supplier } from '@/types/models';

function SuppliersForm({ supplier }: { supplier?: Supplier }) {
    const editing = supplier !== undefined;
    const form = useForm({
        name: supplier?.name ?? '',
        phone: supplier?.phone ?? '',
        email: supplier?.email ?? '',
        address: supplier?.address ?? '',
        is_active: supplier?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        if (supplier) {
            form.put(SupplierController.update.url(supplier.id));
        } else {
            form.post(SupplierController.store.url());
        }
    }

    return (
        <>
            <Head title={editing ? 'Ubah supplier' : 'Tambah supplier'} />
            <PageHeader title={editing ? 'Ubah supplier' : 'Tambah supplier'} />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <TextField
                        id="name"
                        label="Nama supplier"
                        required
                        maxLength={255}
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            id="phone"
                            label="Telepon"
                            type="tel"
                            maxLength={20}
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                            error={form.errors.phone}
                        />
                        <TextField
                            id="email"
                            label="Email"
                            type="email"
                            maxLength={255}
                            value={form.data.email}
                            onChange={(e) => form.setData('email', e.target.value)}
                            error={form.errors.email}
                        />
                    </div>
                    <TextAreaField
                        id="address"
                        label="Alamat"
                        maxLength={5000}
                        value={form.data.address}
                        onChange={(e) => form.setData('address', e.target.value)}
                        error={form.errors.address}
                    />
                    <CheckboxField
                        id="is_active"
                        label="Supplier aktif"
                        checked={form.data.is_active}
                        onChange={(e) => form.setData('is_active', e.target.checked)}
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link href={SupplierController.index.url()} className={buttonClass('secondary')}>
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

SuppliersForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default SuppliersForm;
