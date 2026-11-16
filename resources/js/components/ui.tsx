import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

/** Kelas tombol; dipakai juga untuk <Link> agar tampilannya konsisten. */
export function buttonClass(variant: ButtonVariant = 'primary', className = '') {
    return cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-emerald-700 text-white hover:bg-emerald-800',
        variant === 'secondary' &&
            'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
        variant === 'danger' && 'bg-red-700 text-white hover:bg-red-800',
        className,
    );
}

export function StatusBadge({
    active,
    activeLabel = 'Aktif',
    inactiveLabel = 'Nonaktif',
}: {
    active: boolean | number;
    activeLabel?: string;
    inactiveLabel?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                active
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700',
            )}
        >
            {active ? activeLabel : inactiveLabel}
        </span>
    );
}

export function PageHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
}) {
    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-slate-600">{description}</p>
                )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    );
}

export function Card({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-lg border border-slate-200 bg-white shadow-sm',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <p className="text-base font-medium text-slate-900">{title}</p>
            {description && (
                <p className="max-w-md text-sm text-slate-600">{description}</p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}

export function DescriptionList({
    items,
}: {
    items: { label: string; value: ReactNode }[];
}) {
    return (
        <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {items.map((item) => (
                <div key={item.label}>
                    <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                        {item.label}
                    </dt>
                    <dd className="mt-1 text-sm break-words text-slate-900">
                        {item.value ?? '-'}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
