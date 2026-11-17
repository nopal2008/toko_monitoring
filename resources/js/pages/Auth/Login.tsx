import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { BarChart3, Eye, EyeOff, Package, UserCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { store as loginStore } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import { BrandLogo } from '@/components/brand-logo';
import { CheckboxField, TextField } from '@/components/fields';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const highlights = [
    { icon: BarChart3, text: 'Penjualan semua cabang dalam satu dashboard' },
    { icon: Package, text: 'Stok menipis terpantau sebelum habis' },
    { icon: UserCheck, text: 'Absensi karyawan per cabang' },
];

export default function Login() {
    const { name } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
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
            <div className="grid min-h-screen lg:grid-cols-2">
                <div className="relative hidden overflow-hidden bg-linear-to-br from-brand-600 to-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                    <div className="bg-grid absolute inset-0 opacity-30" aria-hidden="true" />
                    <div
                        className="absolute -right-24 -bottom-24 size-96 rounded-full bg-white/10 blur-3xl"
                        aria-hidden="true"
                    />
                    <BrandLogo name={name} inverted className="relative" />
                    <div className="relative max-w-md">
                        <h2 className="text-4xl leading-[1.1] font-semibold tracking-tight">
                            Pantau semua cabang, tanpa spreadsheet.
                        </h2>
                        <ul className="mt-8 space-y-4">
                            {highlights.map((item) => (
                                <li key={item.text} className="flex items-center gap-3 text-white/90">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                                        <item.icon className="size-[18px]" aria-hidden="true" />
                                    </span>
                                    <span className="text-sm">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="relative text-sm text-white/70">Store Monitoring System</p>
                </div>

                <div className="relative flex items-center justify-center px-4 py-10">
                    <div className="absolute top-4 right-4">
                        <ThemeToggle />
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="w-full max-w-sm"
                    >
                        <BrandLogo name={name} className="mb-8 lg:hidden" />
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Selamat datang kembali
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Masuk untuk memantau operasional toko Anda.
                        </p>

                        <form onSubmit={submit} noValidate className="mt-8 space-y-5">
                            <TextField
                                id="email"
                                label="Email"
                                type="email"
                                autoComplete="username"
                                autoFocus
                                required
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                error={form.errors.email}
                            />
                            <div>
                                <Label htmlFor="password">Kata sandi</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        required
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        aria-invalid={form.errors.password ? true : undefined}
                                        aria-describedby={form.errors.password ? 'password-error' : undefined}
                                        className="pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                        aria-pressed={showPassword}
                                        className={cn(
                                            'absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none',
                                        )}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" aria-hidden="true" />
                                        ) : (
                                            <Eye className="size-4" aria-hidden="true" />
                                        )}
                                    </button>
                                </div>
                                {form.errors.password && (
                                    <p id="password-error" role="alert" className="mt-1.5 text-xs text-danger-fg">
                                        {form.errors.password}
                                    </p>
                                )}
                            </div>
                            <CheckboxField
                                id="remember"
                                label="Ingat saya di perangkat ini"
                                checked={form.data.remember}
                                onChange={(e) => form.setData('remember', e.target.checked)}
                            />
                            <Button type="submit" size="lg" className="w-full" loading={form.processing}>
                                {form.processing ? 'Memproses...' : 'Masuk'}
                            </Button>
                        </form>

                        <p className="mt-8 text-center text-sm text-muted-foreground">
                            Belum punya akun? Hubungi admin toko Anda.
                        </p>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
