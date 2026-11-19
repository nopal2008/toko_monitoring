import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import {
    Check,
    CheckCircle2,
    Clock,
    CreditCard,
    Filter,
    Plus,
    X,
    XCircle,
} from 'lucide-react';
import { Card, EmptyState, PageHeader, buttonClass } from '@/components/ui';
import { Pagination } from '@/components/pagination';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, formatDateOnly } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
    approve as expensesApprove,
    index as expensesIndex,
    store as expensesStore,
} from '@/routes/expenses';
import type { Paginated } from '@/types/models';

type ExpenseRow = {
    id: number;
    store_id: number;
    expense_category_id: number | null;
    title: string;
    amount: string;
    expense_date: string;
    payment_method: string;
    status: 'pending' | 'approved' | 'rejected';
    notes: string | null;
    attachment_path: string | null;
    store: { id: number; name: string } | null;
    category: { id: number; name: string } | null;
    creator: { id: number; name: string } | null;
};

type Props = {
    expenses: Paginated<ExpenseRow>;
};

function StatusBadge({ status }: { status: ExpenseRow['status'] }) {
    const config = {
        pending: {
            label: 'Menunggu',
            icon: Clock,
            className: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        approved: {
            label: 'Disetujui',
            icon: CheckCircle2,
            className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
        rejected: {
            label: 'Ditolak',
            icon: XCircle,
            className: 'bg-rose-100 text-rose-800 border-rose-200',
        },
    }[status];

    const Icon = config.icon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                config.className,
            )}
        >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
        </span>
    );
}

function ExpensesIndex({ expenses }: Props) {
    const { can } = useAuth();
    const { auth } = usePage().props;
    const stores = auth?.stores ?? [];

    const urlParams = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );
    const [fromFilter, setFromFilter] = useState(urlParams.get('from') ?? '');
    const [toFilter, setToFilter] = useState(urlParams.get('to') ?? '');

    // Modal Create
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const createForm = useForm<{
        store_id: number | '';
        expense_category_id: number;
        title: string;
        amount: string;
        expense_date: string;
        payment_method: 'cash' | 'card' | 'transfer' | 'other';
        notes: string;
        attachment: File | null;
    }>({
        store_id: stores[0]?.id ?? '',
        expense_category_id: 1,
        title: '',
        amount: '',
        expense_date: new Date().toISOString().slice(0, 10),
        payment_method: 'cash',
        notes: '',
        attachment: null,
    });

    // Modal Approve / Reject
    const [decisionItem, setDecisionItem] = useState<{
        id: number;
        title: string;
        decision: 'approved' | 'rejected';
    } | null>(null);
    const decisionForm = useForm({
        decision: 'approved' as 'approved' | 'rejected',
        notes: '',
    });

    function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(expensesStore.url(), {
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
        });
    }

    function handleDecision(e: React.FormEvent) {
        e.preventDefault();
        if (!decisionItem) {
            return;
        }

        decisionForm.transform(() => ({
            decision: decisionItem.decision,
            notes: decisionForm.data.notes,
        }));

        decisionForm.post(expensesApprove.url(decisionItem.id), {
            onSuccess: () => {
                setDecisionItem(null);
                decisionForm.reset();
            },
        });
    }

    function applyFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(
            expensesIndex.url(),
            {
                ...(fromFilter ? { from: fromFilter } : {}),
                ...(toFilter ? { to: toFilter } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    function resetFilter() {
        setFromFilter('');
        setToFilter('');
        router.get(
            expensesIndex.url(),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Pengeluaran" />
            <PageHeader
                title="Pengeluaran Operasional"
                description="Catat dan verifikasi seluruh pengeluaran operasional cabang."
                actions={
                    can('expense.create') && (
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className={buttonClass('primary')}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Catat Pengeluaran</span>
                        </button>
                    )
                }
            />

            {/* Create Modal */}
            {createModalOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="create-expense-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                >
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
                        <h2
                            id="create-expense-title"
                            className="text-lg font-semibold text-slate-900"
                        >
                            Catat Pengeluaran Baru
                        </h2>
                        <form
                            onSubmit={handleCreate}
                            className="mt-4 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="exp-store"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Toko / Cabang{' '}
                                    <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    id="exp-store"
                                    required
                                    value={createForm.data.store_id}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'store_id',
                                            Number(e.target.value) || '',
                                        )
                                    }
                                    className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                >
                                    <option value="">Pilih Cabang</option>
                                    {stores.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="exp-title"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Judul Pengeluaran{' '}
                                    <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="exp-title"
                                    required
                                    placeholder="Contoh: Pembelian token listrik toko"
                                    value={createForm.data.title}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'title',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                />
                                {createForm.errors.title && (
                                    <p className="mt-1 text-xs text-rose-600">
                                        {createForm.errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="exp-amount"
                                        className="mb-1 block text-sm font-medium text-slate-700"
                                    >
                                        Nominal (Rp){' '}
                                        <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="exp-amount"
                                        required
                                        min="1"
                                        step="1"
                                        placeholder="150000"
                                        value={createForm.data.amount}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'amount',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                    />
                                    {createForm.errors.amount && (
                                        <p className="mt-1 text-xs text-rose-600">
                                            {createForm.errors.amount}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="exp-date"
                                        className="mb-1 block text-sm font-medium text-slate-700"
                                    >
                                        Tanggal{' '}
                                        <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="exp-date"
                                        required
                                        value={createForm.data.expense_date}
                                        onChange={(e) =>
                                            createForm.setData(
                                                'expense_date',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="exp-payment"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Metode Pembayaran{' '}
                                    <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    id="exp-payment"
                                    value={createForm.data.payment_method}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'payment_method',
                                            e.target.value as
                                                | 'cash'
                                                | 'card'
                                                | 'transfer'
                                                | 'other',
                                        )
                                    }
                                    className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                >
                                    <option value="cash">
                                        Tunai (Kas Toko)
                                    </option>
                                    <option value="transfer">
                                        Transfer Bank
                                    </option>
                                    <option value="card">Kartu / Debit</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="exp-notes"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Catatan Tambahan
                                </label>
                                <textarea
                                    id="exp-notes"
                                    rows={2}
                                    value={createForm.data.notes}
                                    onChange={(e) =>
                                        createForm.setData(
                                            'notes',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Rincian pembelian atau keperluan..."
                                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="exp-attachment"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Bukti Struk / Nota (Opsional)
                                </label>
                                <input
                                    type="file"
                                    id="exp-attachment"
                                    accept="image/*,.pdf"
                                    onChange={(e) =>
                                        createForm.setData(
                                            'attachment',
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    disabled={createForm.processing}
                                    className={buttonClass('secondary')}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className={buttonClass('primary')}
                                >
                                    {createForm.processing
                                        ? 'Menyimpan...'
                                        : 'Ajukan Pengeluaran'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Decision Modal (Approve / Reject) */}
            {decisionItem && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="decision-title"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                >
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2
                            id="decision-title"
                            className="text-lg font-semibold text-slate-900"
                        >
                            {decisionItem.decision === 'approved'
                                ? 'Setujui Pengeluaran?'
                                : 'Tolak Pengeluaran?'}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Konfirmasi keputusan untuk pengeluaran:{' '}
                            <strong className="text-slate-900">
                                {decisionItem.title}
                            </strong>
                        </p>
                        <form
                            onSubmit={handleDecision}
                            className="mt-4 space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="decision-notes"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Catatan Keputusan (Opsional)
                                </label>
                                <textarea
                                    id="decision-notes"
                                    rows={2}
                                    value={decisionForm.data.notes}
                                    onChange={(e) =>
                                        decisionForm.setData(
                                            'notes',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Disetujui sesuai kuitansi fisik / Ditolak karena di luar anggaran"
                                    className="w-full rounded-md border border-slate-300 p-2.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDecisionItem(null)}
                                    disabled={decisionForm.processing}
                                    className={buttonClass('secondary')}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={decisionForm.processing}
                                    className={buttonClass(
                                        decisionItem.decision === 'approved'
                                            ? 'primary'
                                            : 'danger',
                                    )}
                                >
                                    {decisionForm.processing
                                        ? 'Memproses...'
                                        : decisionItem.decision === 'approved'
                                          ? 'Ya, Setujui'
                                          : 'Ya, Tolak'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            <Card className="mb-6 p-4">
                <form
                    onSubmit={applyFilter}
                    className="flex flex-wrap items-end gap-3"
                >
                    <div className="w-full sm:w-auto">
                        <label
                            htmlFor="filter-from"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            id="filter-from"
                            value={fromFilter}
                            onChange={(e) => setFromFilter(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                    </div>

                    <div className="w-full sm:w-auto">
                        <label
                            htmlFor="filter-to"
                            className="mb-1 block text-xs font-medium text-slate-700"
                        >
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            id="filter-to"
                            value={toFilter}
                            onChange={(e) => setToFilter(e.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className={buttonClass('primary', 'h-9 px-3')}
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                        </button>
                        {(fromFilter || toFilter) && (
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
                {expenses.data.length === 0 ? (
                    <EmptyState
                        title="Belum ada catatan pengeluaran"
                        description="Pengeluaran operasional toko yang diajukan akan tampil di sini."
                        action={
                            can('expense.create') && (
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(true)}
                                    className={buttonClass('primary')}
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Catat Pengeluaran Pertama</span>
                                </button>
                            )
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[50rem] text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium tracking-wider text-slate-600 uppercase">
                                <tr>
                                    <th scope="col" className="px-5 py-3">
                                        Judul Pengeluaran
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Toko
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-5 py-3 text-right"
                                    >
                                        Nominal
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Tanggal
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Metode
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Status
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Diajukan Oleh
                                    </th>
                                    {can('expense.approve') && (
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-right"
                                        >
                                            Aksi
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {expenses.data.map((exp) => (
                                    <tr
                                        key={exp.id}
                                        className="transition hover:bg-slate-50/50"
                                    >
                                        <td className="px-5 py-3.5 font-medium whitespace-nowrap text-slate-900">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-4 w-4 text-slate-400" />
                                                <span>{exp.title}</span>
                                            </div>
                                            {exp.notes && (
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {exp.notes}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                                            {exp.store?.name ?? '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold whitespace-nowrap text-slate-900">
                                            {formatCurrency(exp.amount)}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                                            {formatDateOnly(exp.expense_date)}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs whitespace-nowrap text-slate-600 uppercase">
                                            {exp.payment_method}
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <StatusBadge status={exp.status} />
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">
                                            {exp.creator?.name ?? '-'}
                                        </td>
                                        {can('expense.approve') && (
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                {exp.status === 'pending' ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDecisionItem(
                                                                    {
                                                                        id: exp.id,
                                                                        title: exp.title,
                                                                        decision:
                                                                            'approved',
                                                                    },
                                                                )
                                                            }
                                                            className={buttonClass(
                                                                'primary',
                                                                'h-7 px-2 text-xs',
                                                            )}
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            <span>Setujui</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDecisionItem(
                                                                    {
                                                                        id: exp.id,
                                                                        title: exp.title,
                                                                        decision:
                                                                            'rejected',
                                                                    },
                                                                )
                                                            }
                                                            className={buttonClass(
                                                                'danger',
                                                                'h-7 px-2 text-xs',
                                                            )}
                                                        >
                                                            <X className="h-3 w-3" />
                                                            <span>Tolak</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">
                                                        Sudah diproses
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <Pagination
                    links={expenses.links}
                    from={expenses.from}
                    to={expenses.to}
                    total={expenses.total}
                />
            </Card>
        </>
    );
}

ExpensesIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default ExpensesIndex;
