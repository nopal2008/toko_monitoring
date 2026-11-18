import { Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Clock, Filter } from 'lucide-react';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import { ReportTabs } from '@/components/report-tabs';
import AppLayout from '@/layouts/app-layout';
import { formatDateOnly } from '@/lib/format';
import { cn } from '@/lib/utils';
import { attendance as reportsAttendance } from '@/routes/reports';
import type { Paginated } from '@/types/models';

type AttendanceReportRow = {
    id: number;
    employee_id: number;
    store_id: number;
    date: string;
    check_in_at: string | null;
    check_out_at: string | null;
    status: 'present' | 'absent' | 'late' | 'leave';
    employee: { id: number; name: string; employee_code: string } | null;
    store: { id: number; name: string } | null;
};

type Props = {
    report: Paginated<AttendanceReportRow>;
    filters: {
        from?: string;
        to?: string;
        status?: string;
        store_id?: number;
    };
};

function StatusBadge({ status }: { status: AttendanceReportRow['status'] }) {
    const config = {
        present: { label: 'Hadir', className: 'bg-emerald-100 text-emerald-800' },
        late: { label: 'Terlambat', className: 'bg-amber-100 text-amber-800' },
        absent: { label: 'Tidak Hadir', className: 'bg-rose-100 text-rose-800' },
        leave: { label: 'Izin / Cuti', className: 'bg-sky-100 text-sky-800' },
    }[status] ?? { label: status, className: 'bg-slate-100 text-slate-800' };

    return (
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', config.className)}>
            {config.label}
        </span>
    );
}

function ReportsAttendance({ report, filters }: Props) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            reportsAttendance.url(),
            {
                ...(from ? { from } : {}),
                ...(to ? { to } : {}),
                ...(status ? { status } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Laporan Absensi" />
            <PageHeader
                title="Laporan Absensi & Jam Kerja"
                description="Rekapitulasi riwayat kehadiran, keterlambatan, dan jam kerja staf."
            />

            <ReportTabs current="attendance" filters={{ from, to, status }} />

            {/* Filter */}
            <Card className="mb-6 p-4">
                <form onSubmit={applyFilter} className="flex flex-wrap items-end gap-3">
                    <div>
                        <label htmlFor="from" className="mb-1 block text-xs font-medium text-slate-700">
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            id="from"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="to" className="mb-1 block text-xs font-medium text-slate-700">
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            id="to"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="mb-1 block text-xs font-medium text-slate-700">
                            Status
                        </label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        >
                            <option value="">Semua Status</option>
                            <option value="present">Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="leave">Izin / Cuti</option>
                            <option value="absent">Tidak Hadir</option>
                        </select>
                    </div>

                    <button type="submit" className={buttonClass('primary', 'h-9 px-3')}>
                        <Filter className="h-4 w-4" />
                        <span>Terapkan</span>
                    </button>
                </form>
            </Card>

            <Card>
                {report.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada catatan absensi"
                        description="Belum ada riwayat absensi yang tercatat untuk filter ini."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[44rem] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600">
                                <tr>
                                    <th scope="col" className="px-5 py-3">Karyawan</th>
                                    <th scope="col" className="px-5 py-3">Toko</th>
                                    <th scope="col" className="px-5 py-3">Tanggal</th>
                                    <th scope="col" className="px-5 py-3">Jam Masuk</th>
                                    <th scope="col" className="px-5 py-3">Jam Keluar</th>
                                    <th scope="col" className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {report.data.map((row) => (
                                    <tr key={row.id} className="transition hover:bg-slate-50/50">
                                        <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                                            {row.employee?.name ?? '-'}
                                            <span className="ml-2 font-mono text-xs text-slate-400">
                                                {row.employee?.employee_code}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                                            {row.store?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                                            {formatDateOnly(row.date)}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs text-slate-900 whitespace-nowrap">
                                            {row.check_in_at ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-emerald-600" />
                                                    {row.check_in_at.slice(11, 16) || row.check_in_at}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs text-slate-900 whitespace-nowrap">
                                            {row.check_out_at ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    {row.check_out_at.slice(11, 16) || row.check_out_at}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <StatusBadge status={row.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination
                    links={report.links}
                    from={report.from}
                    to={report.to}
                    total={report.total}
                />
            </Card>
        </>
    );
}

ReportsAttendance.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ReportsAttendance;
