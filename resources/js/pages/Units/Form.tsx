import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import UnitController from '@/actions/App/Http/Controllers/UnitController';
import { CheckboxField, TextField } from '@/components/fields';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import type { Unit } from '@/types/models';

function UnitsForm({ unit }: { unit?: Unit }) {
    const editing = unit !== undefined;
    const form = useForm({
        name: unit?.name ?? '',
        symbol: unit?.symbol ?? '',
        is_active: unit?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        if (unit) {
            form.put(UnitController.update.url(unit.id));
        } else {
            form.post(UnitController.store.url());
        }
    }

    return (
        <>
            <Head title={editing ? 'Ubah satuan' : 'Tambah satuan'} />
            <PageHeader title={editing ? 'Ubah satuan' : 'Tambah satuan'} description="Nama dan simbol satuan." />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <TextField
                        id="name"
                        label="Nama satuan"
                        required
                        maxLength={255}
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                    />
                    <TextField
                        id="symbol"
                        label="Simbol"
                        required
                        maxLength={10}
                        value={form.data.symbol}
                        onChange={(e) => form.setData('symbol', e.target.value)}
                        error={form.errors.symbol}
                    />
                    <CheckboxField
                        id="is_active"
                        label="Satuan aktif"
                        checked={form.data.is_active}
                        onChange={(e) => form.setData('is_active', e.target.checked)}
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link href={UnitController.index.url()} className={buttonClass('secondary')}>
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

UnitsForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default UnitsForm;
