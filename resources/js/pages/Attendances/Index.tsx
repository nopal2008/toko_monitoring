import { Head, router, useForm } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Clock, Filter, LogIn, LogOut, User } from 'lucide-react';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatDateOnly } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
    checkIn as attendancesCheckIn,
    checkOut as attendancesCheckOut,
    index as attendancesIndex,
} from '@/routes/attendances';
import type { Paginated } from '@/types/models';

type AttendanceRow = {
    id: number;
    store_id: number;
    employee_id: number;
    date: string;
    check_in_at: string | null;
    check_out_at: string | null;
    status: 'present' | 'absent' | 'late' | 'leave';
    notes: string | null;
    photo_path: string | null;
    store: { id: number; name: string } | null;
    employee: { id: number; name: string; employee_code: string } | null;
};

type Props = {
    attendances: Paginated<AttendanceRow>;
};

function StatusBadge({ status }: { status: AttendanceRow['status'] }) {
    const config = {
        present: {
            label: 'Hadir',
            className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
        late: {
            label: 'Terlambat',
            className: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        absent: {
            label: 'Tidak Hadir',
            className: 'bg-rose-100 text-rose-800 border-rose-200',
        },
        leave: {
            label: 'Izin / Cuti',
            className: 'bg-sky-100 text-sky-800 border-sky-200',
        },
    }[status] ?? {
        label: status,
        className: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

function AttendancesIndex({ attendances }: Props) {
    const urlParams = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );
    const [dateFilter, setDateFilter] = useState(urlParams.get('date') ?? '');
    const [statusFilter, setStatusFilter] = useState(
        urlParams.get('status') ?? '',
    );

    // Modal Check-in / Check-out
    const [modalMode, setModalMode] = useState<'check-in' | 'check-out' | null>(
        null,
    );

    const checkInForm = useForm<{
        notes: string;
        latitude: number | null;
        longitude: number | null;
        photo: File | null;
    }>({
        notes: '',
        latitude: null,
        longitude: null,
        photo: null,
    });

    const checkOutForm = useForm<{
        latitude: number | null;
        longitude: number | null;
        photo: File | null;
    }>({
        latitude: null,
        longitude: null,
        photo: null,
    });

    function openModal(mode: 'check-in' | 'check-out') {
        setModalMode(mode);
        // Tangkap koordinat lokasi browser jika diizinkan
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (mode === 'check-in') {
                        checkInForm.setData((data) => ({
                            ...data,
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                        }));
                    } else {
                        checkOutForm.setData((data) => ({
                            ...data,
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                        }));
                    }
                },
                () => {
                    // Abaikan jika GPS ditolak
                },
            );
        }
    }

    function submitCheckIn(e: React.FormEvent) {
        e.preventDefault();
        checkInForm.post(attendancesCheckIn.url(), {
            onSuccess: () => {
                setModalMode(null);
                checkInForm.reset();
            },
        });
    }

    function submitCheckOut(e: React.FormEvent) {
        e.preventDefault();
        checkOutForm.post(attendancesCheckOut.url(), {
            onSuccess: () => {
                setModalMode(null);
                checkOutForm.reset();
            },
        });
    }

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            attendancesIndex.url(),
            {
                ...(dateFilter ? { date: dateFilter } : {}),
                ...(statusFilter ? { status: statusFilter } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function resetFilter() {
        setDateFilter('');
        setStatusFilter('');
        router.get(
            attendancesIndex.url(),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Absensi" />
            <PageHeader
                title="Absensi Karyawan"
                description="Catat dan pantau kehadiran staf harian di seluruh cabang."
                actions={
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => openModal('check-in')}
                            className={buttonClass('primary')}
                        >
                            <LogIn className="h-4 w-4" />
                            <span>Check-in Mandiri</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => openModal('check-out')}
                            className={buttonClass('secondary')}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Check-out</span>
                        </button>
                    </div>
                }
            />

            {/* Check-in Modal */}
            {modalMode === 'check-in' && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="checkin-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                >
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2
                            id="checkin-title"
                            className="text-lg font-semibold text-slate-900"
                        >
                            Check-in Kehadiran
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Catat jam masuk Anda hari ini (
                            {formatDateOnly(new Date().toISOString())}).
                        </p>
                        <form
                            onSubmit={submitCheckIn}
                            className="mt-4 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="checkin-notes"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    id="checkin-notes"
                                    rows={2}
                                    value={checkInForm.data.notes}
                                    onChange={(e) =>
                                        checkInForm.setData(
                                            'notes',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Masuk shift pagi"
                                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="checkin-photo"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Foto Bukti (Opsional)
                                </label>
                                <input
                                    type="file"
                                    id="checkin-photo"
                                    accept="image/*"
                                    onChange={(e) =>
                                        checkInForm.setData(
                                            'photo',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                                />
                            </div>

                            {checkInForm.data.latitude && (
                                <p className="text-xs text-emerald-700">
                                    &bull; Lokasi GPS berhasil dideteksi:{' '}
                                    {checkInForm.data.latitude.toFixed(4)},{' '}
                                    {checkInForm.data.longitude?.toFixed(4)}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalMode(null)}
                                    disabled={checkInForm.processing}
                                    className={buttonClass('secondary')}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={checkInForm.processing}
                                    className={buttonClass('primary')}
                                >
                                    {checkInForm.processing
                                        ? 'Memproses...'
                                        : 'Kirim Check-in'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Check-out Modal */}
            {modalMode === 'check-out' && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="checkout-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                >
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2
                            id="checkout-title"
                            className="text-lg font-semibold text-slate-900"
                        >
                            Check-out Selesai Kerja
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Konfirmasi jam keluar kerja Anda hari ini.
                        </p>
                        <form
                            onSubmit={submitCheckOut}
                            className="mt-4 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="checkout-photo"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Foto Bukti (Opsional)
                                </label>
                                <input
                                    type="file"
                                    id="checkout-photo"
                                    accept="image/*"
                                    onChange={(e) =>
                                        checkOutForm.setData(
                                            'photo',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalMode(null)}
                                    disabled={checkOutForm.processing}
                                    className={buttonClass('secondary')}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={checkOutForm.processing}
                                    className={buttonClass('primary')}
                                >
                                    {checkOutForm.processing
                                        ? 'Memproses...'
                                        : 'Kirim Check-out'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filter */}
            <Card className="mb-6 p-4">
                <form
                    onSubmit={applyFilter}
                    className="flex flex-wrap items-end gap-3"
                >
                    <div className="w-full sm:w-auto">
                        <label
                            htmlFor="filter-date"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
                            Tanggal
                        </label>
                        <input
                            type="date"
                            id="filter-date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                    </div>

                    <div className="w-full sm:w-auto">
                        <label
                            htmlFor="filter-status"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
                            Status
                        </label>
                        <select
                            id="filter-status"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        >
                            <option value="">Semua Status</option>
                            <option value="present">Hadir</option>
                            <option value="late">Terlambat</option>
                            <option value="leave">Izin / Cuti</option>
                            <option value="absent">Tidak Hadir</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className={buttonClass('primary', 'h-9 px-3')}
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                        </button>
                        {(dateFilter || statusFilter) && (
                            <button
                                type="button"
                                onClick={resetFilter}
                                className={buttonClass('secondary', 'h-9 px-3')}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </form>
            </Card>

            <Card>
                {attendances.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada catatan absensi"
                        description="Data absensi karyawan akan tercatat otomatis saat staf melakukan check-in."
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[48rem] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium tracking-wider text-slate-600 uppercase">
                                <tr>
                                    <th scope="col" className="px-5 py-3">
                                        Karyawan
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Toko
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Tanggal
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Jam Masuk
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Jam Keluar
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Status
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Catatan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attendances.data.map((att) => (
                                    <tr
                                        key={att.id}
                                        className="transition hover:bg-slate-50/50"
                                    >
                                        <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-slate-400" />
                                                <span>
                                                    {att.employee?.name ?? '-'}
                                                </span>
                                            </div>
                                            <span className="font-mono text-xs text-slate-400">
                                                {att.employee?.employee_code ??
                                                    ''}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                                            {att.store?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                                            {formatDateOnly(att.date)}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-900">
                                            {att.check_in_at ? (
                                                <span className="inline-flex items-center gap-1 font-mono text-xs">
                                                    <Clock className="h-3 w-3 text-emerald-600" />
                                                    {att.check_in_at.slice(
                                                        11,
                                                        16,
                                                    ) || att.check_in_at}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-900">
                                            {att.check_out_at ? (
                                                <span className="inline-flex items-center gap-1 font-mono text-xs">
                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                    {att.check_out_at.slice(
                                                        11,
                                                        16,
                                                    ) || att.check_out_at}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <StatusBadge status={att.status} />
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-slate-500">
                                            {att.notes ?? '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination
                    links={attendances.links}
                    from={attendances.from}
                    to={attendances.to}
                    total={attendances.total}
                />
            </Card>
        </>
    );
}

AttendancesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default AttendancesIndex;
