import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCountUp } from '@/hooks/use-count-up';
import { cn } from '@/lib/utils';

type Tone = 'brand' | 'success' | 'warning' | 'info';

const toneClass: Record<Tone, string> = {
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    success: 'bg-success/15 text-success-fg',
    warning: 'bg-warning/15 text-warning-fg',
    info: 'bg-info/15 text-info-fg',
};

export function StatCard({
    icon: Icon,
    label,
    value,
    format,
    tone = 'brand',
}: {
    icon: LucideIcon;
    label: string;
    value: number;
    format: (value: number) => string;
    tone?: Tone;
}) {
    const animated = useCountUp(value);

    return (
        <Card interactive className="p-6">
            <div
                className={cn(
                    'flex size-10 items-center justify-center rounded-full',
                    toneClass[tone],
                )}
            >
                <Icon className="size-5" aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                {format(Math.round(animated))}
            </p>
        </Card>
    );
}
