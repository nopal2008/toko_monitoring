import { Link, router, usePage } from '@inertiajs/react';
import { MotionConfig, motion } from 'framer-motion';
import {
    BadgePercent,
    Box,
    Building2,
    ChevronRight,
    ChevronsUpDown,
    ClipboardList,
    Archive,
    LayoutDashboard,
    LogOut,
    MapPin,
    Menu,
    Package,
    PanelLeftClose,
    PanelLeftOpen,
    Receipt,
    ShoppingCart,
    Tag,
    Tags,
    Truck,
    Users,
    Warehouse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Fragment, useState } from 'react';
import { destroy as logout } from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import AreaController from '@/actions/App/Http/Controllers/AreaController';
import BrandController from '@/actions/App/Http/Controllers/BrandController';
import CategoryController from '@/actions/App/Http/Controllers/CategoryController';
import ProductController from '@/actions/App/Http/Controllers/ProductController';
import PurchaseController from '@/actions/App/Http/Controllers/PurchaseController';
import PromotionController from '@/actions/App/Http/Controllers/PromotionController';
import StockOpnameController from '@/actions/App/Http/Controllers/StockOpnameController';
import StoreController from '@/actions/App/Http/Controllers/StoreController';
import SupplierController from '@/actions/App/Http/Controllers/SupplierController';
import UnitController from '@/actions/App/Http/Controllers/UnitController';
import WarehouseController from '@/actions/App/Http/Controllers/WarehouseController';
import { BrandLogo } from '@/components/brand-logo';
import { FlashToaster } from '@/components/flash-toaster';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogDescription,
    DialogTitle,
    SheetContent,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as accountsIndex } from '@/routes/accounts';
import { stop as stopImpersonation } from '@/routes/impersonation';
import { index as posIndex } from '@/routes/pos';
import { index as transactionsIndex } from '@/routes/transactions';

type NavItem = {
    label: string;
    href: string;
    /** Awalan path untuk menandai menu aktif. */
    match: string;
    icon: LucideIcon;
    visible: boolean;
};

type NavGroup = { label: string; items: NavItem[] };

const SEGMENT_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    stores: 'Cabang',
    products: 'Produk',
    categories: 'Kategori',
    suppliers: 'Supplier',
    cashier: 'Kasir',
    pos: 'Kasir (POS)',
    transactions: 'Transaksi',
    areas: 'Area',
    brands: 'Merek',
    create: 'Tambah',
    edit: 'Ubah',
    units: 'Satuan',
    warehouses: 'Gudang',
    promotions: 'Promosi',
    'stock-opnames': 'Stock Opname',
    archive: 'Manajemen Arsip',
};

function breadcrumbsFor(pathname: string) {
    const segments = pathname.split('/').filter(Boolean);
    let href = '';

    return segments.map((segment, index) => {
        href += `/${segment}`;

        return {
            href,
            label:
                SEGMENT_LABELS[segment] ??
                (/^\d+$/.test(segment) ? 'Detail' : segment),
            last: index === segments.length - 1,
        };
    });
}

function initialsOf(name: string | undefined) {
    return (name ?? '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

function NavLink({
    item,
    active,
    collapsed,
    indicatorId,
    onNavigate,
}: {
    item: NavItem;
    active: boolean;
    collapsed: boolean;
    indicatorId: string;
    onNavigate?: () => void;
}) {
    const link = (
        <Link
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            aria-label={collapsed ? item.label : undefined}
            className={cn(
                'relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none',
                active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-0',
            )}
        >
            {active && (
                <motion.span
                    layoutId={indicatorId}
                    className="absolute top-2 left-0 h-6 w-1 rounded-r bg-primary"
                />
            )}
            <item.icon className="size-[18px] shrink-0" aria-hidden="true" />
            {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
    );

    if (!collapsed) {
        return link;
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
    );
}

function UserMenu({ collapsed }: { collapsed: boolean }) {
    const { user, roles } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Menu pengguna"
                    className={cn(
                        'flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none',
                        collapsed && 'justify-center',
                    )}
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                        {initialsOf(user?.name)}
                    </span>
                    {!collapsed && (
                        <>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium text-foreground">
                                    {user?.name}
                                </span>
                                <span className="block truncate text-xs text-muted-foreground capitalize">
                                    {roles[0]?.replace('_', ' ') ?? 'Pengguna'}
                                </span>
                            </span>
                            <ChevronsUpDown
                                className="size-4 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start">
                <DropdownMenuLabel>
                    <span className="block truncate font-medium">
                        {user?.name}
                    </span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                        {user?.email}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={signOut}
                    disabled={loggingOut}
                    className="text-danger-fg"
                >
                    <LogOut aria-hidden="true" />
                    {loggingOut ? 'Keluar...' : 'Keluar'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function SidebarContent({
    groups,
    pathname,
    collapsed,
    indicatorId,
    appName,
    onNavigate,
}: {
    groups: NavGroup[];
    pathname: string;
    collapsed: boolean;
    indicatorId: string;
    appName: string;
    onNavigate?: () => void;
}) {
    return (
        <div className="flex h-full flex-col">
            <div
                className={cn(
                    'flex h-16 shrink-0 items-center border-b border-border px-4',
                    collapsed && 'justify-center px-0',
                )}
            >
                <BrandLogo name={appName} showName={!collapsed} />
            </div>
            <nav
                aria-label="Menu utama"
                className="flex-1 space-y-5 overflow-y-auto p-3"
            >
                {groups.map((group) => (
                    <div key={group.label}>
                        {!collapsed && (
                            <p className="mb-1 px-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.href}
                                    item={item}
                                    active={
                                        pathname === item.match ||
                                        pathname.startsWith(`${item.match}/`)
                                    }
                                    collapsed={collapsed}
                                    indicatorId={indicatorId}
                                    onNavigate={onNavigate}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="shrink-0 border-t border-border p-3">
                <UserMenu collapsed={collapsed} />
            </div>
        </div>
    );
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const { name, impersonation, auth } = usePage().props;
    const { url } = usePage();
    const { can, hasAnyRole } = useAuth();
    const [collapsed, setCollapsed] = useState(() => {
        try {
            return localStorage.getItem('sidebar-collapsed') === '1';
        } catch {
            return false;
        }
    });
    const [sheetOpen, setSheetOpen] = useState(false);

    const isOwnerOrAdmin = hasAnyRole('owner', 'admin');
    const pathname = url.split('?')[0];

    // Aturan tampil mengikuti middleware di routes/web.php. Backend tetap
    // menjadi penentu izin; ini hanya merapikan navigasi.
    const groups: NavGroup[] = [
        {
            label: 'Ringkasan',
            items: [
                {
                    label: 'Dashboard',
                    href: dashboard.url(),
                    match: '/dashboard',
                    icon: LayoutDashboard,
                    visible: hasAnyRole(
                        'owner',
                        'admin',
                        'area_manager',
                        'store_manager',
                    ),
                },
                {
                    label: 'Dashboard Kasir',
                    href: '/cashier',
                    match: '/cashier',
                    icon: Users,
                    visible: hasAnyRole('cashier'),
                },
                {
                    label: 'Manajemen Arsip',
                    href: '/archive',
                    match: '/archive',
                    icon: Archive,
                    visible: isOwnerOrAdmin,
                },
            ],
        },
        {
            label: 'Transaksi',
            items: [
                {
                    label: 'Kasir (POS)',
                    href: posIndex.url(),
                    match: '/pos',
                    icon: ShoppingCart,
                    visible: can('transaction.create'),
                },
                {
                    label: 'Riwayat Transaksi',
                    href: transactionsIndex.url(),
                    match: '/transactions',
                    icon: Receipt,
                    visible: can('transaction.view'),
                },
            ],
        },
        {
            label: 'Master data',
            items: [
                {
                    label: 'Cabang',
                    href: StoreController.index.url(),
                    match: '/stores',
                    icon: Building2,
                    visible: isOwnerOrAdmin,
                },
                {
                    label: 'Produk',
                    href: ProductController.index.url(),
                    match: '/products',
                    icon: Package,
                    visible: can('product.view'),
                },
                {
                    label: 'Kategori',
                    href: CategoryController.index.url(),
                    match: '/categories',
                    icon: Tags,
                    visible: can('product.view'),
                },
                {
                    label: 'Promosi',
                    href: PromotionController.index.url(),
                    match: '/promotions',
                    icon: BadgePercent,
                    visible:
                        hasAnyRole('owner', 'admin', 'area_manager') &&
                        can('product.manage'),
                },
                {
                    label: 'Supplier',
                    href: SupplierController.index.url(),
                    match: '/suppliers',
                    icon: Truck,
                    visible: isOwnerOrAdmin && can('product.manage'),
                },
                {
                    label: 'Pembelian',
                    href: PurchaseController.index.url(),
                    match: '/purchases',
                    icon: Truck,
                    visible: can('purchase.view') || can('purchase.manage'),
                },
                {
                    label: 'Area',
                    href: AreaController.index.url(),
                    match: '/areas',
                    icon: MapPin,
                    visible: isOwnerOrAdmin,
                },
                {
                    label: 'Gudang',
                    href: WarehouseController.index.url(),
                    match: '/warehouses',
                    icon: Warehouse,
                    visible: can('warehouse.view'),
                },
                {
                    label: 'Merek',
                    href: BrandController.index.url(),
                    match: '/brands',
                    icon: Tag,
                    visible: can('brand.view'),
                },
                {
                    label: 'Satuan',
                    href: UnitController.index.url(),
                    match: '/units',
                    icon: Box,
                    visible: can('unit.view'),
                },
                {
                    label: 'Akun pengguna',
                    href: accountsIndex.url(),
                    match: '/accounts',
                    icon: Users,
                    visible: isOwnerOrAdmin && can('user.manage'),
                },
            ],
        },
        {
            label: 'Inventaris',
            items: [
                {
                    label: 'Stock Opname',
                    href: StockOpnameController.index.url(),
                    match: '/stock-opnames',
                    icon: ClipboardList,
                    visible: can('inventory.adjust'),
                },
            ],
        },
    ]
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.visible),
        }))
        .filter((group) => group.items.length > 0);

    function toggleCollapsed() {
        const next = !collapsed;

        setCollapsed(next);

        try {
            localStorage.setItem('sidebar-collapsed', next ? '1' : '0');
        } catch {}
    }

    const crumbs = breadcrumbsFor(pathname);

    return (
        <MotionConfig reducedMotion="user">
            <TooltipProvider delayDuration={150}>
                <a
                    href="#main"
                    className="sr-only rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
                >
                    Lewati ke konten
                </a>

                <aside
                    className={cn(
                        'fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-card transition-[width] duration-250 ease-out lg:block',
                        collapsed ? 'w-16' : 'w-64',
                    )}
                >
                    <SidebarContent
                        groups={groups}
                        pathname={pathname}
                        collapsed={collapsed}
                        indicatorId="nav-indicator-desktop"
                        appName={name}
                    />
                </aside>

                <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetContent>
                        <DialogTitle className="sr-only">
                            Menu navigasi
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Daftar halaman aplikasi
                        </DialogDescription>
                        <SidebarContent
                            groups={groups}
                            pathname={pathname}
                            collapsed={false}
                            indicatorId="nav-indicator-mobile"
                            appName={name}
                            onNavigate={() => setSheetOpen(false)}
                        />
                    </SheetContent>
                </Dialog>

                <div
                    className={cn(
                        'min-h-screen bg-background transition-[padding] duration-250 ease-out',
                        collapsed ? 'lg:pl-16' : 'lg:pl-64',
                    )}
                >
                    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setSheetOpen(true)}
                            aria-label="Buka menu"
                        >
                            <Menu aria-hidden="true" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:inline-flex"
                            onClick={toggleCollapsed}
                            aria-label={
                                collapsed
                                    ? 'Perluas sidebar'
                                    : 'Ciutkan sidebar'
                            }
                        >
                            {collapsed ? (
                                <PanelLeftOpen aria-hidden="true" />
                            ) : (
                                <PanelLeftClose aria-hidden="true" />
                            )}
                        </Button>

                        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                {crumbs.map((crumb) => (
                                    <Fragment key={crumb.href}>
                                        <li className="min-w-0 truncate">
                                            {crumb.last ? (
                                                <span
                                                    aria-current="page"
                                                    className="font-medium text-foreground"
                                                >
                                                    {crumb.label}
                                                </span>
                                            ) : (
                                                <span>{crumb.label}</span>
                                            )}
                                        </li>
                                        {!crumb.last && (
                                            <li aria-hidden="true">
                                                <ChevronRight className="size-3.5" />
                                            </li>
                                        )}
                                    </Fragment>
                                ))}
                            </ol>
                        </nav>

                        <ThemeToggle />
                    </header>

                    {impersonation && (
                        <div
                            role="status"
                            className="sticky top-16 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground md:px-6"
                        >
                            <span>
                                Anda masuk sebagai{' '}
                                <strong>{auth.user?.name}</strong>
                                {impersonation.actor
                                    ? ` atas nama ${impersonation.actor.name}`
                                    : ' melalui sesi impersonasi'}
                                .
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    router.post(stopImpersonation.url())
                                }
                            >
                                Kembali ke akun owner
                            </Button>
                        </div>
                    )}

                    <motion.main
                        id="main"
                        key={pathname}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 lg:px-8 lg:py-8"
                    >
                        {children}
                    </motion.main>
                </div>

                <FlashToaster />
            </TooltipProvider>
        </MotionConfig>
    );
}



