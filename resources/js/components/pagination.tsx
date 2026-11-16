import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { PageLink } from '@/types/models';
import { formatNumber } from '@/lib/format';

// Label dari paginator Laravel berisi entitas HTML; jangan dirender mentah.
function labelFor(label: string) {
    if (/previous/i.test(label)) {
        return 'Sebelumnya';
    }

    if (/next/i.test(label)) {
        return 'Berikutnya';
    }

    return label;
}

export function Pagination({
    links,
    from,
    to,
    total,
}: {
    links: PageLink[];
    from: number | null;
    to: number | null;
    total: number;
}) {
    if (total === 0) {
        return null;
    }

    return (
        <nav
            aria-label="Navigasi halaman"
            className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-sm text-slate-600">
                Menampilkan {formatNumber(from)}-{formatNumber(to)} dari{' '}
                {formatNumber(total)} data
            </p>
            {links.length > 3 && (
                <ul className="flex flex-wrap gap-1">
                    {links.map((link, index) => {
                        const text = labelFor(link.label);
                        const base =
                            'inline-flex min-w-9 items-center justify-center rounded-md border px-2.5 py-1.5 text-sm';

                        return (
                            <li key={`${index}-${link.label}`}>
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        aria-current={
                                            link.active ? 'page' : undefined
                                        }
                                        className={cn(
                                            base,
                                            link.active
                                                ? 'border-emerald-700 bg-emerald-700 text-white'
                                                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
                                        )}
                                    >
                                        {text}
                                    </Link>
                                ) : (
                                    <span
                                        className={cn(
                                            base,
                                            'cursor-not-allowed border-slate-200 text-slate-400',
                                        )}
                                    >
                                        {text}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </nav>
    );
}
