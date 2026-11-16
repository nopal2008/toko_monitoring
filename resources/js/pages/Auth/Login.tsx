import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { store as loginStore } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { CheckboxField, TextField } from '@/components/fields';
import { buttonClass } from '@/components/ui';

export default function Login() {
    const { name } = usePage().props;
    const form = useForm({ email: '', password: '', remember: false });

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        form.post(loginStore.url(), {
            onFinish: () => form.reset('password'),
        });
    }

    return (
        <>
            <Head title="Masuk" />
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
                <div className="w-full max-w-sm">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            {name}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Masuk untuk memantau operasional toko.
                        </p>
                    </div>
                    <form
                        onSubmit={submit}
                        noValidate
                        className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                    >
                        <TextField
                            id="email"
                            label="Email"
                            type="email"
                            autoComplete="username"
                            autoFocus
                            required
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            error={form.errors.email}
                        />
                        <TextField
                            id="password"
                            label="Kata sandi"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            error={form.errors.password}
                        />
                        <CheckboxField
                            id="remember"
                            label="Ingat saya di perangkat ini"
                            checked={form.data.remember}
                            onChange={(e) =>
                                form.setData('remember', e.target.checked)
                            }
                        />
                        <button
                            type="submit"
                            disabled={form.processing}
                            className={buttonClass('primary', 'w-full')}
                        >
                            {form.processing ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
