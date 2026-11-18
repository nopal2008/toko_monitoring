import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CheckboxField, SelectField, TextField } from '@/components/fields';
import { Card, PageHeader, buttonClass } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import {
    index as employeesIndex,
    store as employeesStore,
    update as employeesUpdate,
} from '@/routes/employees';

type EmployeeFormData = {
    id?: number;
    store_id: number | '';
    user_id?: number | null;
    employee_code: string;
    name: string;
    phone: string;
    email: string;
    position: string;
    join_date: string;
    resign_date: string;
    is_active: boolean;
};

type Props = {
    employee?: EmployeeFormData;
};

function EmployeesForm({ employee }: Props) {
    const isEdit = Boolean(employee?.id);
    const { auth } = usePage().props;
    const stores = auth?.stores ?? [];

    const form = useForm<EmployeeFormData>({
        store_id: employee?.store_id ?? (stores[0]?.id ?? ''),
        employee_code: employee?.employee_code ?? '',
        name: employee?.name ?? '',
        phone: employee?.phone ?? '',
        email: employee?.email ?? '',
        position: employee?.position ?? '',
        join_date: employee?.join_date ?? '',
        resign_date: employee?.resign_date ?? '',
        is_active: employee?.is_active ?? true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (isEdit && employee?.id) {
            form.put(employeesUpdate.url(employee.id));
        } else {
            form.post(employeesStore.url());
        }
    }

    return (
        <>
            <Head title={isEdit ? 'Ubah Karyawan' : 'Tambah Karyawan'} />

            <div className="mb-4">
                <Link
                    href={employeesIndex.url()}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-600 transition hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali ke Daftar Karyawan</span>
                </Link>
            </div>

            <PageHeader
                title={isEdit ? 'Ubah Karyawan' : 'Tambah Karyawan Baru'}
                description={
                    isEdit
                        ? `Memperbarui data karyawan ${employee?.name}`
                        : 'Masukkan informasi karyawan baru dan tentukan penempatan cabang toko.'
                }
            />

            <Card className="max-w-2xl p-6">
                <form onSubmit={submit} className="space-y-4">
                    <SelectField
                        id="store_id"
                        label="Penempatan Toko / Cabang"
                        required
                        value={form.data.store_id}
                        onChange={(e) =>
                            form.setData('store_id', Number(e.target.value) || '')
                        }
                        error={form.errors.store_id}
                    >
                        <option value="">Pilih Cabang</option>
                        {stores.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.code})
                            </option>
                        ))}
                    </SelectField>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            id="employee_code"
                            label="Kode Karyawan"
                            required
                            placeholder="Contoh: EMP-001"
                            value={form.data.employee_code}
                            onChange={(e) => form.setData('employee_code', e.target.value)}
                            error={form.errors.employee_code}
                        />

                        <TextField
                            id="name"
                            label="Nama Lengkap"
                            required
                            placeholder="Nama karyawan"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            error={form.errors.name}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            id="position"
                            label="Jabatan / Posisi"
                            placeholder="Contoh: Kasir, Staf Gudang, Supervisor"
                            value={form.data.position}
                            onChange={(e) => form.setData('position', e.target.value)}
                            error={form.errors.position}
                        />

                        <TextField
                            id="phone"
                            label="Nomor Telepon"
                            type="tel"
                            placeholder="081234567890"
                            value={form.data.phone}
                            onChange={(e) => form.setData('phone', e.target.value)}
                            error={form.errors.phone}
                        />
                    </div>

                    <TextField
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="karyawan@example.com"
                        value={form.data.email}
                        onChange={(e) => form.setData('email', e.target.value)}
                        error={form.errors.email}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            id="join_date"
                            label="Tanggal Bergabung"
                            type="date"
                            value={form.data.join_date}
                            onChange={(e) => form.setData('join_date', e.target.value)}
                            error={form.errors.join_date}
                        />

                        <TextField
                            id="resign_date"
                            label="Tanggal Berhenti"
                            type="date"
                            value={form.data.resign_date}
                            onChange={(e) => form.setData('resign_date', e.target.value)}
                            error={form.errors.resign_date}
                        />
                    </div>

                    <CheckboxField
                        id="is_active"
                        label="Karyawan Aktif"
                        checked={form.data.is_active}
                        onChange={(e) => form.setData('is_active', e.target.checked)}
                    />

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <Link
                            href={employeesIndex.url()}
                            className={buttonClass('secondary')}
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className={buttonClass('primary')}
                        >
                            {form.processing
                                ? 'Menyimpan...'
                                : isEdit
                                ? 'Simpan Perubahan'
                                : 'Tambah Karyawan'}
                        </button>
                    </div>
                </form>
            </Card>
        </>
    );
}

EmployeesForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default EmployeesForm;
