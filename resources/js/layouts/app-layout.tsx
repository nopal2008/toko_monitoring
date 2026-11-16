import { Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { FlashMessage } from '@/components/flash-message';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { destroy as logout } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import StoreController from '@/actions/App/Http/Controllers/StoreController';
import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import { dashboard } from '@/routes';

type NavItem = {
    label: string;
    href: string;
    /** Awalan path untuk menandai menu aktif. */
    match: string;
    visible: boolean;
};

export default function AppLayout({ children }: { children: ReactNode }) {
    const { name } = usePage().props;
    const { url } = usePage();
    const { user, can, hasAnyRole } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const isOwnerOrAdmin = hasAnyRole('owner', 'admin');

    // Aturan tampil mengikuti middleware di routes/web.php. Backend tetap
    // menjadi penentu izin; ini hanya merapikan navigasi.
    const items: NavItem[] = [
        {
            label: 'Dashboard',
            href: dashboard.url(),
            match: '/dashboard',
            visible: hasAnyRole(
                'owner',
                'admin',
                'area_manager',
                'store_manager',
            ),
        },
        {
            label: 'Cabang',
            href: StoreController.index.url(),
            match: '/stores',
            visible: isOwnerOrAdmin,
        },
        {
            label: 'Produk',
            href: ProductController.index.url(),
            match: '/products',
            visible: can('product.view'),
        },
        {
            label: 'Kategori',
            href: CategoryController.index.url(),
            match: '/categories',
            visible: can('product.view'),
        },
        {
            label: 'Supplier',
            href: SupplierController.index.url(),
            match: '/suppliers',
            visible: isOwnerOrAdmin && can('product.manage'),
        },
    ];

    const visibleItems = items.filter((item) => item.visible);
    const pathname = url.split('?')[0];

    function signOut() {
        if (loggingOut) {
            return;
        }

        router.post(
            logout.url(),
            {},
            {
                onStart: () => setLoggingOut(true),
                onFinish: () => setLoggingOut(false),
            },
        );
    }

    const nav = (
        <nav aria-label="Menu utama" className="flex-1 space-y-1 px-3 py-4">
            {visibleItems.map((item) => {
                const active =
                    pathname === item.match ||
                    pathname.startsWith(`${item.match}/`);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'block rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-emerald-400',
                            active
                                ? 'bg-emerald-700 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                        )}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 transition-transform lg:translate-x-0',
                    menuOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="border-b border-slate-800 px-5 py-4">
                    <p className="text-base font-semibold text-white">
                        {name}
                    </p>
                    <p className="text-xs text-slate-400">Store Monitoring</p>
                </div>
                {nav}
                <div className="border-t border-slate-800 p-4">
                    <p className="truncate text-sm font-medium text-white">
                        {user?.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                        {user?.email}
                    </p>
                    <button
                        type="button"
                        onClick={signOut}
                        disabled={loggingOut}
                        className="mt-3 w-full rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-emerald-400 disabled:opacity-60"
                    >
                        {loggingOut ? 'Keluar...' : 'Keluar'}
                    </button>
                </div>
            </aside>

            {menuOpen && (
                <button
                    type="button"
                    aria-label="Tutup menu"
                    onClick={() => setMenuOpen(false)}
                    className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
                />
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(true)}
                        aria-expanded={menuOpen}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-emerald-600"
                    >
                        Menu
                    </button>
                    <span className="text-sm font-semibold">{name}</span>
                </header>
                <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                    <FlashMessage />
                    {children}
                </main>
            </div>
        </div>
    );
}
