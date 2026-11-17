import { Store } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandLogo({
    name,
    showName = true,
    className,
    inverted = false,
}: {
    name: string;
    showName?: boolean;
    className?: string;
    /** Untuk latar berwarna (panel brand di halaman login). */
    inverted?: boolean;
}) {
    return (
        <span className={cn('inline-flex items-center gap-2.5', className)}>
            <span
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl',
                    inverted
                        ? 'bg-white/15 text-white'
                        : 'bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-soft',
                )}
            >
                <Store className="size-5" aria-hidden="true" />
            </span>
            {showName && (
                <span
                    className={cn(
                        'font-heading text-base font-semibold tracking-tight',
                        inverted ? 'text-white' : 'text-foreground',
                    )}
                >
                    {name}
                </span>
            )}
        </span>
    );
}
