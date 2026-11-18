import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import WarehouseController from '@/actions/App/Http/Controllers/WarehouseController';
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/fields';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import type { Warehouse } from '@/types/models';

function WarehousesForm({
    warehouse,
    stores,
}: {
    warehouse?: Warehouse;
    stores: { id: number; name: string; code: string }[];
}) {
    const editing = warehouse !== undefined;
    const form = useForm({
        name: warehouse?.name ?? '',
        code: warehouse?.code ?? '',
        type: warehouse?.type ?? 'branch',
        store_id: warehouse?.store_id ? warehouse.store_id.toString() : '',
        address: warehouse?.address ?? '',
        is_active: warehouse?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        if (warehouse) {
            form.put(WarehouseController.update.url(warehouse.id));
        } else {
            form.post(WarehouseController.store.url());
        }
    }

    return (
        <>
            <Head title={editing ? 'Ubah gudang' : 'Tambah gudang'} />
            <PageHeader
                title={editing ? 'Ubah gudang' : 'Tambah gudang'}
                description="Gudang pusat atau gudang cabang."
            />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <TextField
                        id="name"
                        label="Nama gudang"
                        required
                        maxLength={255}
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        error={form.errors.name}
                    />
                    <TextField
                        id="code"
                        label="Kode gudang"
                        required
                        maxLength={50}
                        value={form.data.code}
                        onChange={(e) => form.setData('code', e.target.value)}
                        error={form.errors.code}
                    />
                    <SelectField
                        id="type"
                        label="Tipe gudang"
                        required
                        value={form.data.type}
                        onChange={(e) => form.setData('type', e.target.value)}
                        error={form.errors.type}
                    >
                        <option value="central">Gudang pusat</option>
                        <option value="branch">Gudang cabang</option>
                    </SelectField>
                    {form.data.type === 'branch' && (
                        <SelectField
                            id="store_id"
                            label="Cabang"
                            required
                            value={form.data.store_id}
                            onChange={(e) => form.setData('store_id', e.target.value)}
                            error={form.errors.store_id}
                        >
                            <option value="">Pilih cabang</option>
                            {stores.map((store) => (
                                <option key={store.id} value={store.id}>
                                    {store.name}
                                </option>
                            ))}
                        </SelectField>
                    )}
                    <TextAreaField
                        id="address"
                        label="Alamat"
                        value={form.data.address}
                        onChange={(e) => form.setData('address', e.target.value)}
                        error={form.errors.address}
                    />
                    <CheckboxField
                        id="is_active"
                        label="Gudang aktif"
                        checked={form.data.is_active}
                        onChange={(e) => form.setData('is_active', e.target.checked)}
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link href={WarehouseController.index.url()} className={buttonClass('secondary')}>
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

WarehousesForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default WarehousesForm;
