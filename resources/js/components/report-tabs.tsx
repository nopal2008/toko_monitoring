import { Link } from '@inertiajs/react';
import { BarChart3, CalendarCheck, CreditCard, Download, Warehouse } from 'lucide-react';
import { buttonClass } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
    attendance as reportsAttendance,
    expenses as reportsExpenses,
    exportMethod as reportsExport,
    inventory as reportsInventory,
    sales as reportsSales,
} from '@/routes/reports';

type ReportType = 'sales' | 'inventory' | 'attendance' | 'expenses';

export function ReportTabs({
    current,
    filters = {},
}: {
    current: ReportType;
    filters?: Record<string, string | number | boolean | null | undefined>;
}) {
    const tabs = [
        { id: 'sales' as const, label: 'Penjualan', href: reportsSales.url(), icon: BarChart3 },
        { id: 'inventory' as const, label: 'Inventori', href: reportsInventory.url(), icon: Warehouse },
        { id: 'attendance' as const, label: 'Absensi', href: reportsAttendance.url(), icon: CalendarCheck },
        { id: 'expenses' as const, label: 'Pengeluaran', href: reportsExpenses.url(), icon: CreditCard },
    ];

    // Build URL download CSV untuk ekspor
    const cleanFilters: Record<string, string> = {};
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
            cleanFilters[k] = String(v);
        }
    });

    const exportUrl = reportsExport.url(current, { query: cleanFilters });

    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <nav className="flex flex-wrap gap-1" aria-label="Tab Laporan">
                {tabs.map((tab) => {
                    const active = tab.id === current;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition',
                                active
                                    ? 'bg-emerald-700 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <a
                href={exportUrl}
                download
                className={buttonClass('secondary', 'h-9 px-3 text-xs')}
            >
                <Download className="h-4 w-4" />
                <span>Ekspor CSV</span>
            </a>
        </div>
    );
}
