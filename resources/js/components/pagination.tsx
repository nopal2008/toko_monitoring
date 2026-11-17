import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PageLink } from '@/types/models';

// Label dari paginator Laravel berisi entitas HTML; jangan dirender mentah.
function kindOf(label: string) {
    if (/previous/i.test(label)) {
        return 'previous' as const;
    }

    if (/next/i.test(label)) {
        return 'next' as const;
    }

    return 'page' as const;
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
            className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-6"
        >
            <p className="text-sm text-muted-foreground">
                Menampilkan{' '}
                <span className="font-medium text-foreground tabular-nums">
                    {formatNumber(from)}-{formatNumber(to)}
                </span>{' '}
                dari{' '}
                <span className="font-medium text-foreground tabular-nums">
                    {formatNumber(total)}
                </span>{' '}
                data
            </p>
            {links.length > 3 && (
                <ul className="flex flex-wrap items-center gap-1">
                    {links.map((link, index) => {
                        const kind = kindOf(link.label);
                        const base =
                            'inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg px-2.5 text-sm font-medium transition-colors';
                        const content =
                            kind === 'previous' ? (
                                <>
                                    <ChevronLeft className="size-4" aria-hidden="true" />
                                    <span className="sr-only sm:not-sr-only">Sebelumnya</span>
                                </>
                            ) : kind === 'next' ? (
                                <>
                                    <span className="sr-only sm:not-sr-only">Berikutnya</span>
                                    <ChevronRight className="size-4" aria-hidden="true" />
                                </>
                            ) : (
                                link.label
                            );

                        return (
                            <li key={`${index}-${link.label}`}>
                                {link.url ? (
                                    <Link
                                        href={link.url}
                                        preserveScroll
                                        aria-current={link.active ? 'page' : undefined}
                                        className={cn(
                                            base,
                                            'focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none',
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'text-foreground hover:bg-muted',
                                        )}
                                    >
                                        {content}
                                    </Link>
                                ) : (
                                    <span
                                        className={cn(base, 'cursor-not-allowed text-muted-foreground/50')}
                                    >
                                        {content}
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
