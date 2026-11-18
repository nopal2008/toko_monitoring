import { Head, Link } from '@inertiajs/react';
import { login as loginRoute, dashboard } from '@/routes';
import { usePage } from '@inertiajs/react';

// ===================== Ikon SVG Inline =====================

function IconBarChart() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
            <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
    );
}

function IconPackage() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="m7.5 4.27 9 5.15" />
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    );
}

function IconUsers() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function IconFileText() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
        </svg>
    );
}

function IconBell() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    );
}

function IconBuilding() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
            <path d="M12 14h.01" />
            <path d="M16 10h.01" />
            <path d="M16 14h.01" />
            <path d="M8 10h.01" />
            <path d="M8 14h.01" />
        </svg>
    );
}

// ===================== Komponen Section =====================

type FeatureCardProps = {
    icon: React.ReactNode;
    title: string;
    description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                {icon}
            </div>
            <h3 className="mb-2 text-base font-semibold text-slate-900">
                {title}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600">
                {description}
            </p>
        </div>
    );
}

type StepCardProps = {
    step: number;
    title: string;
    description: string;
};

function StepCard({ step, title, description }: StepCardProps) {
    return (
        <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                {step}
            </div>
            <div>
                <h3 className="mb-1 text-base font-semibold text-slate-900">
                    {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                    {description}
                </p>
            </div>
        </div>
    );
}

// ===================== Landing Page =====================

export default function LandingIndex() {
    const { name, auth } = usePage().props;
    const isLoggedIn = Boolean(auth.user);

    return (
        <>
            <Head>
                <title>{name} — Pantau Toko Anda dengan Mudah</title>
                <meta
                    name="description"
                    content="Sistem monitoring toko multi-cabang: kelola stok, transaksi, karyawan, dan laporan keuangan dalam satu platform."
                />
            </Head>

            {/* ===== Navigasi ===== */}
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-700">
                            {name}
                        </span>
                    </div>

                    {/* Nav links — desktop */}
                    <nav
                        className="hidden items-center gap-6 md:flex"
                        aria-label="Navigasi utama"
                    >
                        <a
                            href="#fitur"
                            className="text-sm font-medium text-slate-700 transition hover:text-emerald-700"
                        >
                            Fitur
                        </a>
                        <a
                            href="#cara-kerja"
                            className="text-sm font-medium text-slate-700 transition hover:text-emerald-700"
                        >
                            Cara Kerja
                        </a>
                    </nav>

                    <div className="flex items-center gap-2">
                        {isLoggedIn ? (
                            <Link
                                href={dashboard.url()}
                                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                href={loginRoute.url()}
                                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
                            >
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* ===== Hero ===== */}
                <section className="bg-gradient-to-b from-emerald-50 to-white px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
                    <div className="mx-auto max-w-3xl">
                        <span className="mb-4 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                            Sistem Monitoring Toko
                        </span>
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                            Pantau Semua Cabang{' '}
                            <span className="text-emerald-700">
                                dalam Satu Platform
                            </span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600">
                            Kelola stok, transaksi, karyawan, dan laporan
                            keuangan seluruh cabang toko Anda secara real-time
                            — dari mana saja, kapan saja.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href={loginRoute.url()}
                                className="rounded-lg bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                            >
                                Mulai Sekarang
                            </Link>
                            <a
                                href="#fitur"
                                className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                Lihat Fitur
                            </a>
                        </div>
                    </div>

                    {/* Dashboard mockup placeholder */}
                    <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
                            <span className="h-3 w-3 rounded-full bg-red-400" />
                            <span className="h-3 w-3 rounded-full bg-yellow-400" />
                            <span className="h-3 w-3 rounded-full bg-green-400" />
                            <span className="ml-3 text-xs text-slate-400">
                                {name} — Dashboard
                            </span>
                        </div>
                        <div className="grid grid-cols-4 gap-3 p-4 sm:p-6">
                            {[
                                { label: 'Penjualan Hari Ini', value: 'Rp 4.250.000' },
                                { label: 'Transaksi', value: '38' },
                                { label: 'Stok Menipis', value: '5 produk' },
                                { label: 'Karyawan Aktif', value: '12' },
                            ].map((kpi) => (
                                <div
                                    key={kpi.label}
                                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                                >
                                    <p className="text-xs text-slate-500">
                                        {kpi.label}
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-slate-900">
                                        {kpi.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="mx-4 mb-4 h-32 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 sm:mx-6 sm:mb-6">
                            <div className="flex h-full items-end gap-1 px-4 pb-4">
                                {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                                    <div
                                        key={i}
                                        className="flex-1 rounded-t bg-emerald-500 opacity-70"
                                        style={{ height: `${h}%` }}
                                        aria-hidden="true"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== Statistik ===== */}
                <section className="border-y border-slate-200 bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
                    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
                        {[
                            { value: '500+', label: 'Cabang Aktif' },
                            { value: '10.000+', label: 'Transaksi/Hari' },
                            { value: '99.9%', label: 'Uptime' },
                            { value: '24/7', label: 'Monitoring' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl font-bold text-emerald-700">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===== Fitur ===== */}
                <section
                    id="fitur"
                    className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
                >
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold text-slate-900">
                                Semua yang Anda Butuhkan
                            </h2>
                            <p className="mt-2 text-slate-600">
                                Fitur lengkap untuk operasional toko multi-cabang
                            </p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={<IconBarChart />}
                                title="Monitoring Real-time"
                                description="Pantau penjualan, transaksi, dan performa cabang secara langsung dengan dashboard yang informatif."
                            />
                            <FeatureCard
                                icon={<IconPackage />}
                                title="Manajemen Stok"
                                description="Kelola stok produk per cabang, terima notifikasi stok menipis, dan lakukan transfer antar cabang."
                            />
                            <FeatureCard
                                icon={<IconUsers />}
                                title="Absensi Karyawan"
                                description="Rekam kehadiran karyawan dengan validasi lokasi GPS dan pantau jam kerja secara akurat."
                            />
                            <FeatureCard
                                icon={<IconFileText />}
                                title="Laporan Keuangan"
                                description="Buat laporan penjualan, pengeluaran, dan inventaris yang detail dan dapat diekspor."
                            />
                            <FeatureCard
                                icon={<IconBell />}
                                title="Notifikasi Otomatis"
                                description="Terima peringatan otomatis untuk stok menipis, transaksi besar, dan aktivitas mencurigakan."
                            />
                            <FeatureCard
                                icon={<IconBuilding />}
                                title="Multi-Cabang"
                                description="Kelola puluhan cabang sekaligus dengan kontrol izin akses yang fleksibel per peran."
                            />
                        </div>
                    </div>
                </section>

                {/* ===== Cara Kerja ===== */}
                <section
                    id="cara-kerja"
                    className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
                >
                    <div className="mx-auto max-w-3xl">
                        <div className="mb-10 text-center">
                            <h2 className="text-3xl font-bold text-slate-900">
                                Cara Kerja
                            </h2>
                            <p className="mt-2 text-slate-600">
                                Mulai dalam 3 langkah mudah
                            </p>
                        </div>
                        <div className="space-y-8">
                            <StepCard
                                step={1}
                                title="Daftar & Tambahkan Cabang"
                                description="Buat akun, konfigurasikan profil bisnis Anda, dan tambahkan seluruh cabang toko beserta stafnya."
                            />
                            <StepCard
                                step={2}
                                title="Catat Transaksi & Stok"
                                description="Kasir mencatat penjualan melalui POS, stok otomatis berkurang, dan data tersimpan secara terpusat."
                            />
                            <StepCard
                                step={3}
                                title="Pantau Dashboard & Laporan"
                                description="Lihat ringkasan performa seluruh cabang dari dashboard, buat laporan, dan ambil keputusan berbasis data."
                            />
                        </div>
                    </div>
                </section>

                {/* ===== CTA Akhir ===== */}
                <section className="bg-emerald-700 px-4 py-16 text-center sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl">
                        <h2 className="mb-3 text-3xl font-bold text-white">
                            Siap Mulai Memantau Toko Anda?
                        </h2>
                        <p className="mb-8 text-emerald-100">
                            Bergabunglah dengan ratusan pemilik toko yang sudah
                            menggunakan {name}.
                        </p>
                        <Link
                            href={loginRoute.url()}
                            className="inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                        >
                            Mulai Sekarang — Gratis
                        </Link>
                    </div>
                </section>
            </main>

            {/* ===== Footer ===== */}
            <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center sm:px-6 lg:px-8">
                <p className="text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} {name}. Semua hak
                    dilindungi.
                </p>
            </footer>
        </>
    );
}
