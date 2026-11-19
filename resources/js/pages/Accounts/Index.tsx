import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Search, ShieldCheck, UserRoundCog } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { DeleteAction } from '@/components/delete-action';
import { Pagination } from '@/components/pagination';
import {
    Card,
    EmptyState,
    PageHeader,
    StatusBadge,
    buttonClass,
} from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { create, destroy, edit, impersonate, index } from '@/routes/accounts';
import type { Paginated } from '@/types/models';

type AccountRow = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    roles: { id: number; name: string }[];
    stores: { id: number; name: string }[];
};

type Props = {
    accounts: Paginated<AccountRow>;
    filters: { search: string; role: string };
    roles: { id: number; name: string }[];
};

function AccountsIndex({ accounts, filters, roles }: Props) {
    const { impersonation, auth } = usePage().props;

    function searchAccounts(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const searchValue = formData.get('search');
        const roleValue = formData.get('role');
        const search = typeof searchValue === 'string' ? searchValue : '';
        const role = typeof roleValue === 'string' ? roleValue : '';

        router.get(
            index.url(),
            { search, role },
            { preserveState: true, preserveScroll: true },
        );
    }

    function startImpersonation(account: AccountRow) {
        router.post(
            impersonate.url(account.id),
            {},
            {
                onBefore: () =>
                    window.confirm(
                        `Masuk sebagai ${account.name}? Aktivitas akan dicatat.`,
                    ),
            },
        );
    }

    return (
        <>
            <Head title="Akun pengguna" />
            <PageHeader
                title="Akun pengguna"
                description="Kelola akses, penempatan cabang, dan status akun dalam tenant Anda."
                actions={
                    <Link
                        href={create.url()}
                        className={buttonClass('primary')}
                    >
                        <Plus aria-hidden="true" />
                        Tambah akun
                    </Link>
                }
            />

            <Card className="mb-5 p-4">
                <form
                    onSubmit={searchAccounts}
                    className="flex flex-col gap-3 sm:flex-row"
                >
                    <label className="relative min-w-0 flex-1">
                        <span className="sr-only">Cari nama atau email</span>
                        <Search
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            name="search"
                            defaultValue={filters.search}
                            placeholder="Cari nama atau email"
                            className="h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm outline-none focus-visible:ring-4 focus-visible:ring-ring/20"
                        />
                    </label>
                    <label>
                        <span className="sr-only">Filter role</span>
                        <select
                            name="role"
                            defaultValue={filters.role}
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm sm:w-52"
                        >
                            <option value="">Semua role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {role.name.replaceAll('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button type="submit" className={buttonClass('secondary')}>
                        Terapkan
                    </button>
                </form>
            </Card>

            <Card>
                {accounts.data.length === 0 ? (
                    <EmptyState
                        title="Akun tidak ditemukan"
                        description="Ubah kata kunci pencarian atau tambahkan akun pengguna baru."
                        action={
                            <Link
                                href={create.url()}
                                className={buttonClass('primary')}
                            >
                                <Plus aria-hidden="true" />
                                Tambah akun
                            </Link>
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[58rem] text-sm">
                            <thead className="border-b border-border bg-muted/50 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                <tr>
                                    <th scope="col" className="px-5 py-3">
                                        Nama / Email
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Role
                                    </th>
                                    <th scope="col" className="px-5 py-3">
                                        Cabang
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
                            <tbody className="divide-y divide-border">
                                {accounts.data.map((account) => (
                                    <tr
                                        key={account.id}
                                        className="transition-colors hover:bg-muted/30"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="font-medium text-foreground">
                                                {account.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {account.email}
                                            </div>
                                            {account.phone && (
                                                <div className="mt-1 text-xs text-muted-foreground">
                                                    {account.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {account.roles.map((role) => (
                                                    <span
                                                        key={role.id}
                                                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize"
                                                    >
                                                        <ShieldCheck
                                                            className="size-3.5"
                                                            aria-hidden="true"
                                                        />
                                                        {role.name.replaceAll(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">
                                            {account.stores
                                                .map((store) => store.name)
                                                .join(', ') ||
                                                'Belum ditetapkan'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                active={account.is_active}
                                            />
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {auth.user?.id !==
                                                    account.id && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            Boolean(
                                                                impersonation,
                                                            ) ||
                                                            !account.is_active
                                                        }
                                                        onClick={() =>
                                                            startImpersonation(
                                                                account,
                                                            )
                                                        }
                                                        className={buttonClass(
                                                            'secondary',
                                                            'h-8 px-2 text-xs',
                                                        )}
                                                        title={
                                                            impersonation
                                                                ? 'Selesaikan sesi impersonasi saat ini terlebih dahulu'
                                                                : undefined
                                                        }
                                                    >
                                                        <UserRoundCog aria-hidden="true" />
                                                        Masuk sebagai
                                                    </button>
                                                )}
                                                <Link
                                                    href={edit.url(account.id)}
                                                    className={buttonClass(
                                                        'secondary',
                                                        'h-8 px-2 text-xs',
                                                    )}
                                                >
                                                    Ubah
                                                </Link>
                                                {auth.user?.id !==
                                                    account.id && (
                                                    <DeleteAction
                                                        url={destroy.url(
                                                            account.id,
                                                        )}
                                                        itemName={account.name}
                                                    />
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
                    links={accounts.links}
                    from={accounts.from}
                    to={accounts.to}
                    total={accounts.total}
                />
            </Card>
        </>
    );
}

AccountsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default AccountsIndex;
