import { Head, Link, usePage } from '@inertiajs/react';
import { MotionConfig, motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BarChart3,
    Building2,
    Menu,
    Package,
    ShoppingCart,
    UserCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button, buttonClass } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogDescription, DialogTitle, SheetContent } from '@/components/ui/dialog';
import { dashboard, login } from '@/routes';

const features: { icon: LucideIcon; title: string; text: string }[] = [
    {
        icon: Activity,
        title: 'Monitoring Terkini',
        text: 'Ringkasan penjualan, transaksi, dan stok menipis dalam satu layar.',
    },
    {
        icon: Package,
        title: 'Manajemen Stok',
        text: 'Pantau stok per cabang, atur stok minimum, dan kelola transfer antar cabang.',
    },
    {
        icon: ShoppingCart,
        title: 'Kasir dan Transaksi',
        text: 'Catat transaksi serta buka dan tutup shift kasir dengan alur yang jelas.',
    },
    {
        icon: UserCheck,
        title: 'Absensi Karyawan',
        text: 'Check-in dan check-out karyawan dengan radius lokasi tiap cabang.',
    },
    {
        icon: BarChart3,
        title: 'Laporan Keuangan',
        text: 'Laporan penjualan, stok, absensi, dan pengeluaran yang siap diekspor.',
    },
    {
        icon: Building2,
        title: 'Multi-Cabang',
        text: 'Kelola banyak cabang dengan hak akses yang berbeda untuk setiap peran.',
    },
];

const steps: { icon: LucideIcon; title: string; text: string }[] = [
    {
        icon: Building2,
        title: 'Siapkan cabang dan produk',
        text: 'Daftarkan cabang, kategori, dan produk yang Anda jual.',
    },
    {
        icon: ShoppingCart,
        title: 'Catat operasional harian',
        text: 'Kasir, stok, absensi, dan pengeluaran tercatat di satu sistem.',
    },
    {
        icon: BarChart3,
        title: 'Pantau dan ambil keputusan',
        text: 'Lihat dashboard dan laporan untuk menentukan langkah berikutnya.',
    },
];

const navLinks = [
    { href: '#fitur', label: 'Fitur' },
    { href: '#cara-kerja', label: 'Cara kerja' },
];

function DashboardIllustration() {
    return (
        <div
            aria-hidden="true"
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-hover"
        >
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-3">
                <span className="size-2.5 rounded-full bg-danger/70" />
                <span className="size-2.5 rounded-full bg-warning/70" />
                <span className="size-2.5 rounded-full bg-success/70" />
            </div>
            <div className="grid grid-cols-[3.5rem_1fr] sm:grid-cols-[10rem_1fr]">
                <div className="space-y-2 border-r border-border p-3">
                    {[0, 1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className={
                                item === 0
                                    ? 'h-7 rounded-lg bg-brand-100 dark:bg-brand-900/60'
                                    : 'h-7 rounded-lg bg-muted'
                            }
                        />
                    ))}
                </div>
                <div className="space-y-4 p-4 sm:p-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[0, 1, 2, 3].map((item) => (
                            <div key={item} className="rounded-xl border border-border p-3">
                                <div className="size-6 rounded-full bg-brand-100 dark:bg-brand-900/60" />
                                <div className="mt-3 h-2 w-12 rounded bg-muted" />
                                <div className="mt-2 h-4 w-16 rounded bg-foreground/15" />
                            </div>
                        ))}
                    </div>
                    <div className="rounded-xl border border-border p-4">
                        <div className="h-2 w-24 rounded bg-muted" />
                        <svg viewBox="0 0 400 120" className="mt-4 h-28 w-full" fill="none" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="illustration-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--brand-500))" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="hsl(var(--brand-500))" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0 90 C40 80 60 50 100 58 S170 95 210 60 S290 20 330 38 S380 30 400 18 V120 H0 Z"
                                fill="url(#illustration-fill)"
                            />
                            <path
                                d="M0 90 C40 80 60 50 100 58 S170 95 210 60 S290 20 330 38 S380 30 400 18"
                                stroke="hsl(var(--brand-500))"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Welcome() {
    const { name, auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const signedIn = auth.user !== null;
    const entry = signedIn ? dashboard.url() : login.url();
    const entryLabel = signedIn ? 'Buka dashboard' : 'Masuk';

    return (
        <MotionConfig reducedMotion="user">
            <Head title="Pantau semua cabang dalam satu dashboard" />

            <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
                    <Link href="/" aria-label={`${name} - beranda`}>
                        <BrandLogo name={name} />
                    </Link>
                    <nav aria-label="Menu utama" className="hidden gap-8 md:flex">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link href={entry} className={buttonClass('primary', 'hidden h-9 px-3 md:inline-flex')}>
                            {entryLabel}
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            aria-label="Buka menu"
                            onClick={() => setMenuOpen(true)}
                        >
                            <Menu aria-hidden="true" />
                        </Button>
                    </div>
                </div>
            </header>

            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent className="p-6">
                    <DialogTitle className="sr-only">Menu</DialogTitle>
                    <DialogDescription className="sr-only">Navigasi halaman utama</DialogDescription>
                    <nav aria-label="Menu seluler" className="mt-10 flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                            >
                                {link.label}
                            </a>
                        ))}
                        <Link href={entry} className={buttonClass('primary', 'mt-4 h-11')}>
                            {entryLabel}
                        </Link>
                    </nav>
                </SheetContent>
            </Dialog>

            <main>
                <section className="relative overflow-hidden">
                    <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden="true" />
                    <div className="absolute top-0 left-1/2 -z-0 size-[40rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand-300/30 blur-3xl dark:bg-brand-900/40" aria-hidden="true" />

                    <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 md:px-6 md:pt-24">
                        <div className="mx-auto max-w-4xl text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            >
                                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                    <Building2 className="size-3.5" aria-hidden="true" />
                                    Store Monitoring untuk bisnis multi-cabang
                                </span>
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
                                className="mt-6 text-5xl leading-[1.05] font-semibold tracking-tight text-foreground md:text-6xl lg:text-7xl"
                            >
                                Pantau seluruh cabang bisnis Anda dari{' '}
                                <span className="bg-linear-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-200">
                                    satu dashboard.
                                </span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.16, ease: 'easeOut' }}
                                className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground"
                            >
                                Penjualan, stok, absensi, dan pengeluaran — tanpa spreadsheet, tanpa drama.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.24, ease: 'easeOut' }}
                                className="mt-9 flex flex-wrap items-center justify-center gap-3"
                            >
                                <Link href={entry} className={buttonClass('primary', 'h-12 px-6 text-base')}>
                                    {entryLabel}
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                                <a href="#fitur" className={buttonClass('secondary', 'h-12 px-6 text-base')}>
                                    Lihat fitur
                                </a>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 32 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.32, ease: 'easeOut' }}
                            className="relative mx-auto mt-16 max-w-4xl"
                        >
                            <DashboardIllustration />
                            <div
                                aria-hidden="true"
                                className="absolute -top-5 -right-2 hidden animate-float items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-hover sm:flex"
                            >
                                <AlertTriangle className="size-4 text-warning-fg" />
                                Stok menipis terpantau
                            </div>
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Ilustrasi tampilan dashboard
                            </p>
                        </motion.div>
                    </div>
                </section>

                <section id="fitur" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 md:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                            Semua yang dibutuhkan operasional toko
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            Dari kasir sampai laporan, tersedia dalam satu sistem yang rapi.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
                            >
                                <Card interactive className="h-full p-6">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                                        <feature.icon className="size-5" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section id="cara-kerja" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 md:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Cara kerja</h2>
                        <p className="mt-3 text-muted-foreground">Tiga langkah untuk mulai memantau.</p>
                    </div>
                    <ol className="relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
                        <div
                            className="absolute top-8 right-[16%] left-[16%] hidden border-t border-dashed border-brand-300 md:block dark:border-brand-800"
                            aria-hidden="true"
                        />
                        {steps.map((step, index) => (
                            <li key={step.title} className="relative text-center">
                                <span
                                    className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-6xl font-semibold text-brand-500/20 select-none"
                                    aria-hidden="true"
                                >
                                    {index + 1}
                                </span>
                                <div className="relative mx-auto flex size-16 items-center justify-center rounded-2xl border border-border bg-card text-brand-700 shadow-soft dark:text-brand-300">
                                    <step.icon className="size-6" aria-hidden="true" />
                                </div>
                                <h3 className="mt-5 text-base font-semibold text-foreground">{step.title}</h3>
                                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                                    {step.text}
                                </p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
                    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 to-brand-800 px-6 py-16 text-center text-white md:py-20">
                        <div className="bg-grid absolute inset-0 opacity-20" aria-hidden="true" />
                        <div className="relative">
                            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                Siap memantau semua cabang Anda?
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-lg text-white/80">
                                Masuk dan lihat kondisi toko Anda hari ini.
                            </p>
                            <Link
                                href={entry}
                                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-medium text-brand-800 transition-all duration-150 hover:bg-white/90 focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:outline-none active:scale-[0.98]"
                            >
                                {entryLabel}
                                <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
                    <div>
                        <BrandLogo name={name} />
                        <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                            Sistem pemantauan operasional untuk bisnis retail multi-cabang.
                        </p>
                    </div>
                    <nav aria-label="Tautan footer" className="flex gap-6 text-sm text-muted-foreground">
                        {navLinks.map((link) => (
                            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                                {link.label}
                            </a>
                        ))}
                        <Link href={entry} className="transition-colors hover:text-foreground">
                            {entryLabel}
                        </Link>
                    </nav>
                </div>
                <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} {name}
                </div>
            </footer>
        </MotionConfig>
    );
}
