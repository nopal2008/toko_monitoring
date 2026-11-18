import { FormEvent, useCallback, useEffect, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

type User = {
    id: number;
    name: string;
    email: string;
};

type Supplier = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
};

type SupplierForm = {
    name: string;
    phone: string;
    email: string;
    address: string;
    is_active: boolean;
};

type ApiErrorResponse = {
    message?: string;
    errors?: Record<string, string[]>;
};

class HttpError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
    }
}

const emptySupplierForm: SupplierForm = {
    name: '',
    phone: '',
    email: '',
    address: '',
    is_active: true,
};

async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');

    if (options.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    const xsrfCookie = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='));

    if (xsrfCookie && options.method && options.method !== 'GET') {
        headers.set('X-XSRF-TOKEN', decodeURIComponent(xsrfCookie.slice(11)));
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        credentials: 'include',
        headers,
    });

    if (!response.ok) {
        const body = (await response.json()) as ApiErrorResponse;
        const validationMessage = body.errors
            ? Object.values(body.errors).flat().join(' ')
            : undefined;
        throw new HttpError(
            validationMessage ?? body.message ?? response.statusText,
            response.status,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Permintaan gagal.';
}

export default function App() {
    const [user, setUser] = useState<User | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [form, setForm] = useState<SupplierForm>(emptySupplierForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [email, setEmail] = useState('owner@demo.test');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    const loadSuppliers = useCallback(async () => {
        if (!user) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await apiRequest<{ data: Supplier[] }>(
                '/suppliers?per_page=100',
            );
            setSuppliers(response.data);
        } catch (requestError) {
            setError(errorMessage(requestError));
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        let isCurrent = true;

        apiRequest<{ data: User }>('/user')
            .then((response) => {
                if (isCurrent) {
                    setUser(response.data);
                }
            })
            .catch((requestError: unknown) => {
                if (isCurrent) {
                    if (
                        !(requestError instanceof HttpError) ||
                        requestError.status !== 401
                    ) {
                        setError(errorMessage(requestError));
                    }
                }
            })
            .finally(() => {
                if (isCurrent) {
                    setIsCheckingSession(false);
                }
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    useEffect(() => {
        if (user) {
            void loadSuppliers();
        }
    }, [loadSuppliers, user]);

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setIsSaving(true);

        try {
            const csrfResponse = await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: { Accept: 'application/json' },
            });

            if (!csrfResponse.ok) {
                throw new HttpError(
                    'Gagal memulai sesi aman.',
                    csrfResponse.status,
                );
            }

            const response = await apiRequest<{ data: User }>('/spa/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            setUser(response.data);
            setPassword('');
        } catch (requestError) {
            setError(errorMessage(requestError));
        } finally {
            setIsSaving(false);
        }
    }

    async function handleLogout() {
        if (!user) {
            return;
        }

        setError('');

        try {
            await apiRequest<void>('/spa/logout', { method: 'POST' });
        } catch (requestError) {
            setError(errorMessage(requestError));
            return;
        }

        setUser(null);
        setSuppliers([]);
    }

    function startEditing(supplier: Supplier) {
        setEditingId(supplier.id);
        setForm({
            name: supplier.name,
            phone: supplier.phone ?? '',
            email: supplier.email ?? '',
            address: supplier.address ?? '',
            is_active: supplier.is_active,
        });
        setError('');
    }

    function resetForm() {
        setEditingId(null);
        setForm(emptySupplierForm);
    }

    async function handleSupplierSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!user) {
            return;
        }

        setIsSaving(true);
        setError('');
        const path =
            editingId === null ? '/suppliers' : `/suppliers/${editingId}`;

        try {
            await apiRequest<Supplier>(path, {
                method: editingId === null ? 'POST' : 'PATCH',
                body: JSON.stringify(form),
            });
            resetForm();
            await loadSuppliers();
        } catch (requestError) {
            setError(errorMessage(requestError));
        } finally {
            setIsSaving(false);
        }
    }

    async function deleteSupplier(supplier: Supplier) {
        if (!user || !window.confirm(`Hapus supplier "${supplier.name}"?`)) {
            return;
        }

        setError('');

        try {
            await apiRequest<void>(`/suppliers/${supplier.id}`, {
                method: 'DELETE',
            });
            await loadSuppliers();
        } catch (requestError) {
            setError(errorMessage(requestError));
        }
    }

    if (!user) {
        if (isCheckingSession) {
            return (
                <main className="login-page">
                    <p className="muted">Memeriksa sesi...</p>
                </main>
            );
        }

        return (
            <main className="login-page">
                <form className="panel login-panel" onSubmit={handleLogin}>
                    <p className="eyebrow">TOKO MONITORING</p>
                    <h1>Masuk ke akun</h1>
                    <p className="muted">
                        Gunakan akun demo yang dibuat melalui{' '}
                        <code>php artisan db:seed</code>.
                    </p>
                    {error && (
                        <p className="error-message" role="alert">
                            {error}
                        </p>
                    )}
                    <label>
                        Email
                        <input
                            autoComplete="username"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Kata sandi
                        <input
                            autoComplete="current-password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            required
                        />
                    </label>
                    <button
                        className="button primary full-width"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
            </main>
        );
    }

    return (
        <main className="app-shell">
            <header className="topbar">
                <div>
                    <p className="eyebrow">TOKO MONITORING</p>
                    <h1>Supplier</h1>
                </div>
                <div className="account">
                    <span>{user?.name ?? user?.email}</span>
                    <button className="button secondary" onClick={handleLogout}>
                        Keluar
                    </button>
                </div>
            </header>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}

            <section className="content-grid">
                <form
                    className="panel supplier-form"
                    onSubmit={handleSupplierSubmit}
                >
                    <h2>
                        {editingId === null
                            ? 'Tambah supplier'
                            : 'Ubah supplier'}
                    </h2>
                    <label>
                        Nama
                        <input
                            value={form.name}
                            onChange={(event) =>
                                setForm({ ...form, name: event.target.value })
                            }
                            required
                        />
                    </label>
                    <label>
                        Telepon
                        <input
                            value={form.phone}
                            onChange={(event) =>
                                setForm({ ...form, phone: event.target.value })
                            }
                        />
                    </label>
                    <label>
                        Email
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                                setForm({ ...form, email: event.target.value })
                            }
                        />
                    </label>
                    <label>
                        Alamat
                        <textarea
                            rows={3}
                            value={form.address}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    address: event.target.value,
                                })
                            }
                        />
                    </label>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    is_active: event.target.checked,
                                })
                            }
                        />
                        Aktif
                    </label>
                    <div className="form-actions">
                        <button className="button primary" disabled={isSaving}>
                            {isSaving
                                ? 'Menyimpan...'
                                : editingId === null
                                  ? 'Simpan'
                                  : 'Simpan perubahan'}
                        </button>
                        {editingId !== null && (
                            <button
                                className="button secondary"
                                type="button"
                                onClick={resetForm}
                            >
                                Batal
                            </button>
                        )}
                    </div>
                </form>

                <section className="panel supplier-list">
                    <div className="list-heading">
                        <div>
                            <h2>Daftar supplier</h2>
                            <p className="muted">
                                Data pemasok pada tenant akun Anda.
                            </p>
                        </div>
                        <button
                            className="button secondary"
                            onClick={() => void loadSuppliers()}
                        >
                            Muat ulang
                        </button>
                    </div>

                    {isLoading ? (
                        <p className="muted">Memuat supplier...</p>
                    ) : suppliers.length === 0 ? (
                        <p className="empty-state">Belum ada supplier.</p>
                    ) : (
                        <div className="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nama</th>
                                        <th>Kontak</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suppliers.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td>
                                                <strong>{supplier.name}</strong>
                                                <small>
                                                    {supplier.address ??
                                                        'Alamat tidak tersedia'}
                                                </small>
                                            </td>
                                            <td>
                                                {supplier.phone ?? '-'}
                                                <small>
                                                    {supplier.email ?? '-'}
                                                </small>
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                        supplier.is_active
                                                            ? 'badge active'
                                                            : 'badge'
                                                    }
                                                >
                                                    {supplier.is_active
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="row-actions">
                                                    <button
                                                        className="button secondary"
                                                        onClick={() =>
                                                            startEditing(
                                                                supplier,
                                                            )
                                                        }
                                                    >
                                                        Ubah
                                                    </button>
                                                    <button
                                                        className="button danger"
                                                        onClick={() =>
                                                            void deleteSupplier(
                                                                supplier,
                                                            )
                                                        }
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}
