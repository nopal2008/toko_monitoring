import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Edit, Eye, Plus, UserCheck } from 'lucide-react';
import {
    Card,
    EmptyState,
    PageHeader,
    StatusBadge,
    buttonClass,
} from '@/components/ui';
import { DeleteAction } from '@/components/delete-action';
import { Pagination } from '@/components/pagination';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import {
    create as employeesCreate,
    destroy as employeesDestroy,
    edit as employeesEdit,
    show as employeesShow,
} from '@/routes/employees';
import type { Paginated } from '@/types/models';

type EmployeeRow = {
    id: number;
    store_id: number;
    user_id: number | null;
    name: string;
    employee_code: string;
    position: string | null;
    is_active: boolean;
    store: { id: number; name: string } | null;
    user: { id: number; name: string; email: string } | null;
};

type Props = {
    employees: Paginated<EmployeeRow>;
};

function EmployeesIndex({ employees }: Props) {
    const { can } = useAuth();

    return (
        <>
            <Head title="Karyawan" />
            <PageHeader
                title="Karyawan"
                description="Kelola data staf dan karyawan seluruh cabang toko."
                actions={
                    can('attendance.manage') && (
                        <Link
                            href={employeesCreate.url()}
                            className={buttonClass('primary')}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Tambah Karyawan</span>
                        </Link>
                    )
                }
            />

            <Card>
                {employees.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada karyawan"
                        description="Tambahkan data karyawan baru untuk mulai mencatat absensi dan jadwal staf."
                        action={
                            can('attendance.manage') && (
                                <Link
                                    href={employeesCreate.url()}
                                    className={buttonClass('primary')}
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah Karyawan Pertama</span>
                                </Link>
                            )
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[44rem] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium tracking-wider text-slate-600 uppercase">
                                <tr>
                                    <th scope="col" className="px-5 py-3">
                                        Kode
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Nama
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Jabatan
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Toko
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right"
                                    >
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {employees.data.map((emp) => (
                                    <tr
                                        key={emp.id}
                                        className="transition hover:bg-slate-50/50"
                                    >
                                        <td className="px-5 py-3.5 font-mono text-xs font-medium whitespace-nowrap text-slate-700">
                                            {emp.employee_code}
                                        </td>
                                        <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-4 w-4 text-slate-400" />
                                                <span>{emp.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                                            {emp.position ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                                            {emp.store?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <StatusBadge
                                                active={emp.is_active}
                                            />
                                        </td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={employeesShow.url(
                                                        emp.id,
                                                    )}
                                                    className={buttonClass(
                                                        'secondary',
                                                        'h-8 px-2 text-xs',
                                                    )}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>Detail</span>
                                                </Link>
                                                {can('attendance.manage') && (
                                                    <>
                                                        <Link
                                                            href={employeesEdit.url(
                                                                emp.id,
                                                            )}
                                                            className={buttonClass(
                                                                'secondary',
                                                                'h-8 px-2 text-xs',
                                                            )}
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                            <span>Ubah</span>
                                                        </Link>
                                                        <DeleteAction
                                                            url={employeesDestroy.url(
                                                                emp.id,
                                                            )}
                                                            itemName={emp.name}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination
                    links={employees.links}
                    from={employees.from}
                    to={employees.to}
                    total={employees.total}
                />
            </Card>
        </>
    );
}

EmployeesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default EmployeesIndex;
