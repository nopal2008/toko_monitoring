import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { ArrowLeft, Edit, Mail, Phone, Store, User, UserCheck } from 'lucide-react';
import { Card, DescriptionList, PageHeader, StatusBadge, buttonClass } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { formatDateOnly } from '@/lib/format';
import { edit as employeesEdit, index as employeesIndex } from '@/routes/employees';

type EmployeeDetail = {
    id: number;
    store_id: number;
    user_id: number | null;
    employee_code: string;
    name: string;
    phone: string | null;
    email: string | null;
    position: string | null;
    join_date: string | null;
    resign_date: string | null;
    is_active: boolean;
    created_at: string;
    store: { id: number; name: string } | null;
    user: { id: number; name: string; email: string } | null;
};

type Props = {
    employee: EmployeeDetail;
};

function EmployeesShow({ employee }: Props) {
    const { can } = useAuth();

    return (
        <>
            <Head title={`Karyawan: ${employee.name}`} />

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
                title={employee.name}
                description={`Kode: ${employee.employee_code} • ${employee.position ?? 'Staf'}`}
                actions={
                    <div className="flex items-center gap-3">
                        <StatusBadge active={employee.is_active} />
                        {can('attendance.manage') && (
                            <Link
                                href={employeesEdit.url(employee.id)}
                                className={buttonClass('secondary', 'h-9 px-3 text-xs')}
                            >
                                <Edit className="h-3.5 w-3.5" />
                                <span>Ubah Data</span>
                            </Link>
                        )}
                    </div>
                }
            />

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">
                        Profil Karyawan
                    </h2>
                    <DescriptionList
                        items={[
                            { label: 'Kode Karyawan', value: employee.employee_code },
                            { label: 'Nama Lengkap', value: employee.name },
                            { label: 'Jabatan / Posisi', value: employee.position ?? '-' },
                            {
                                label: 'Toko Penempatan',
                                value: (
                                    <span className="inline-flex items-center gap-1.5 font-medium">
                                        <Store className="h-4 w-4 text-slate-500" />
                                        {employee.store?.name ?? '-'}
                                    </span>
                                ),
                            },
                            {
                                label: 'Akun Terhubung',
                                value: employee.user ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-slate-500" />
                                        {employee.user.name} ({employee.user.email})
                                    </span>
                                ) : (
                                    'Tidak terhubung akun login'
                                ),
                            },
                        ]}
                    />
                </Card>

                <Card className="p-6">
                    <h2 className="mb-4 text-base font-semibold text-slate-900">
                        Kontak & Kepegawaian
                    </h2>
                    <DescriptionList
                        items={[
                            {
                                label: 'Nomor Telepon',
                                value: employee.phone ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone className="h-4 w-4 text-slate-500" />
                                        {employee.phone}
                                    </span>
                                ) : (
                                    '-'
                                ),
                            },
                            {
                                label: 'Email',
                                value: employee.email ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail className="h-4 w-4 text-slate-500" />
                                        {employee.email}
                                    </span>
                                ) : (
                                    '-'
                                ),
                            },
                            {
                                label: 'Tanggal Bergabung',
                                value: employee.join_date
                                    ? formatDateOnly(employee.join_date)
                                    : '-',
                            },
                            {
                                label: 'Tanggal Berhenti',
                                value: employee.resign_date
                                    ? formatDateOnly(employee.resign_date)
                                    : '-',
                            },
                            {
                                label: 'Terdaftar Sejak',
                                value: formatDateOnly(employee.created_at),
                            },
                        ]}
                    />
                </Card>
            </div>
        </>
    );
}

EmployeesShow.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default EmployeesShow;
