import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import StoreController from '@/actions/App/Http/Controllers/StoreController';
import { CheckboxField, TextAreaField, TextField } from '@/components/fields';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { trimTime } from '@/lib/format';
import type { Store } from '@/types/models';

function StoresForm({ store }: { store?: Store }) {
    const editing = store !== undefined;
    const form = useForm({
        name: store?.name ?? '',
        code: store?.code ?? '',
        address: store?.address ?? '',
        city: store?.city ?? '',
        phone: store?.phone ?? '',
        latitude: store?.latitude ?? '',
        longitude: store?.longitude ?? '',
        radius_meter: String(store?.radius_meter ?? 100),
        opening_time: trimTime(store?.opening_time),
        closing_time: trimTime(store?.closing_time),
        is_active: store?.is_active ?? true,
    });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        if (store) {
            form.put(StoreController.update.url(store.id));
        } else {
            form.post(StoreController.store.url());
        }
    }

    const text = (key: keyof typeof form.data) => ({
        value: String(form.data[key] ?? ''),
        onChange: (e: { target: { value: string } }) =>
            form.setData(key, e.target.value as never),
        error: form.errors[key],
    });

    return (
        <>
            <Head title={editing ? 'Ubah cabang' : 'Tambah cabang'} />
            <PageHeader
                title={editing ? 'Ubah cabang' : 'Tambah cabang'}
                description="Kode cabang harus unik."
            />
            <form onSubmit={submit} noValidate>
                <Card className="space-y-5 p-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            id="name"
                            label="Nama cabang"
                            required
                            maxLength={255}
                            {...text('name')}
                        />
                        <TextField
                            id="code"
                            label="Kode"
                            required
                            maxLength={50}
                            {...text('code')}
                        />
                        <TextField
                            id="city"
                            label="Kota"
                            maxLength={100}
                            {...text('city')}
                        />
                        <TextField
                            id="phone"
                            label="Telepon"
                            type="tel"
                            maxLength={20}
                            {...text('phone')}
                        />
                    </div>
                    <TextAreaField
                        id="address"
                        label="Alamat"
                        maxLength={5000}
                        {...text('address')}
                    />
                    <div className="grid gap-5 sm:grid-cols-3">
                        <TextField
                            id="latitude"
                            label="Latitude"
                            type="number"
                            step="any"
                            min={-90}
                            max={90}
                            {...text('latitude')}
                        />
                        <TextField
                            id="longitude"
                            label="Longitude"
                            type="number"
                            step="any"
                            min={-180}
                            max={180}
                            {...text('longitude')}
                        />
                        <TextField
                            id="radius_meter"
                            label="Radius (meter)"
                            type="number"
                            min={1}
                            max={100000}
                            {...text('radius_meter')}
                        />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            id="opening_time"
                            label="Jam buka"
                            type="time"
                            {...text('opening_time')}
                        />
                        <TextField
                            id="closing_time"
                            label="Jam tutup"
                            type="time"
                            {...text('closing_time')}
                        />
                    </div>
                    <CheckboxField
                        id="is_active"
                        label="Cabang aktif"
                        checked={form.data.is_active}
                        onChange={(e) =>
                            form.setData('is_active', e.target.checked)
                        }
                        error={form.errors.is_active}
                    />
                </Card>
                <div className="mt-4 flex justify-end gap-2">
                    <Link
                        href={StoreController.index.url()}
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

StoresForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default StoresForm;
