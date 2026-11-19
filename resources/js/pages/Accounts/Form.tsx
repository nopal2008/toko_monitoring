import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CheckboxField, SelectField, TextField } from '@/components/fields';
import { Card, PageHeader, buttonClass } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { index, store, update } from '@/routes/accounts';

type AccountData = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    is_active: boolean;
    roles: { name: string }[];
    stores: { id: number }[];
};

type Props = {
    account?: AccountData;
    roles: { id: number; name: string }[];
    stores: { id: number; name: string; code: string }[];
};

function AccountsForm({ account, roles, stores }: Props) {
    const isEdit = Boolean(account);
    const form = useForm({
        name: account?.name ?? '',
        email: account?.email ?? '',
        phone: account?.phone ?? '',
        role: account?.roles[0]?.name ?? '',
        store_ids:
            account?.stores.map((assignedStore) => assignedStore.id) ?? [],
        is_active: account?.is_active ?? true,
        password: '',
        password_confirmation: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (account) {
            form.put(update.url(account.id));
            return;
        }

        form.post(store.url());
    }

    function toggleStore(storeId: number, checked: boolean) {
        form.setData(
            'store_ids',
            checked
                ? [...form.data.store_ids, storeId]
                : form.data.store_ids.filter((id) => id !== storeId),
        );
    }

    return (
        <>
            <Head
                title={isEdit ? 'Ubah akun pengguna' : 'Tambah akun pengguna'}
            />
            <div className="mb-4">
                <Link
                    href={index.url()}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali ke akun pengguna
                </Link>
            </div>
            <PageHeader
                title={isEdit ? 'Ubah akun pengguna' : 'Tambah akun pengguna'}
                description={
                    isEdit
                        ? `Perbarui akses untuk ${account?.name}.`
                        : 'Buat akun dengan role dan penempatan cabang yang sesuai.'
                }
            />
            <Card className="max-w-3xl p-6">
                <form onSubmit={submit} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            id="name"
                            label="Nama lengkap"
                            required
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            error={form.errors.name}
                        />
                        <TextField
                            id="email"
                            label="Email"
                            type="email"
                            required
                            value={form.data.email}
                            onChange={(event) =>
                                form.setData('email', event.target.value)
                            }
                            error={form.errors.email}
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            id="phone"
                            label="Nomor telepon"
                            type="tel"
                            value={form.data.phone}
                            onChange={(event) =>
                                form.setData('phone', event.target.value)
                            }
                            error={form.errors.phone}
                        />
                        <SelectField
                            id="role"
                            label="Role"
                            required
                            value={form.data.role}
                            onChange={(event) =>
                                form.setData('role', event.target.value)
                            }
                            error={form.errors.role}
                        >
                            <option value="">Pilih role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.name}>
                                    {role.name.replaceAll('_', ' ')}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <fieldset className="space-y-2">
                        <legend className="mb-2 text-sm font-medium">
                            Penempatan cabang
                        </legend>
                        {stores.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Belum ada cabang aktif pada tenant ini.
                            </p>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                                {stores.map((store) => (
                                    <label
                                        key={store.id}
                                        className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.data.store_ids.includes(
                                                store.id,
                                            )}
                                            onChange={(event) =>
                                                toggleStore(
                                                    store.id,
                                                    event.target.checked,
                                                )
                                            }
                                            className="size-4 accent-primary"
                                        />
                                        <span>
                                            <span className="block font-medium">
                                                {store.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {store.code}
                                            </span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {form.errors.store_ids && (
                            <p className="text-sm text-danger-fg">
                                {form.errors.store_ids}
                            </p>
                        )}
                    </fieldset>

                    <fieldset className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
                        <legend className="px-1 text-sm font-medium">
                            {isEdit
                                ? 'Ubah kata sandi (opsional)'
                                : 'Kata sandi awal'}
                        </legend>
                        <TextField
                            id="password"
                            label={isEdit ? 'Kata sandi baru' : 'Kata sandi'}
                            type="password"
                            required={!isEdit}
                            autoComplete="new-password"
                            passwordrules="minlength: 12;"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            error={form.errors.password}
                        />
                        <TextField
                            id="password_confirmation"
                            label="Konfirmasi kata sandi"
                            type="password"
                            required={!isEdit}
                            autoComplete="new-password"
                            value={form.data.password_confirmation}
                            onChange={(event) =>
                                form.setData(
                                    'password_confirmation',
                                    event.target.value,
                                )
                            }
                            error={form.errors.password_confirmation}
                        />
                    </fieldset>

                    <CheckboxField
                        id="is_active"
                        label="Akun aktif"
                        checked={form.data.is_active}
                        onChange={(event) =>
                            form.setData('is_active', event.target.checked)
                        }
                    />

                    {Object.entries(form.errors)
                        .filter(
                            ([key]) =>
                                ![
                                    'name',
                                    'email',
                                    'phone',
                                    'role',
                                    'store_ids',
                                    'password',
                                    'password_confirmation',
                                    'is_active',
                                ].includes(key),
                        )
                        .map(([key, message]) => (
                            <p
                                key={key}
                                role="alert"
                                className="text-sm text-danger-fg"
                            >
                                {message}
                            </p>
                        ))}

                    <div className="flex justify-end gap-3 border-t border-border pt-4">
                        <Link
                            href={index.url()}
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
                                  ? 'Simpan perubahan'
                                  : 'Buat akun'}
                        </button>
                    </div>
                </form>
            </Card>
        </>
    );
}

AccountsForm.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default AccountsForm;
