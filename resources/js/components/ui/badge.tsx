import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap',
    {
        variants: {
            variant: {
                default:
                    'bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200',
                success: 'bg-success/15 text-success-fg',
                warning: 'bg-warning/15 text-warning-fg',
                danger: 'bg-danger/15 text-danger-fg',
                muted: 'border border-border bg-muted text-muted-foreground',
            },
        },
        defaultVariants: { variant: 'default' },
    },
);

export function Badge({
    className,
    variant,
    ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
    return (
        <span className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}
