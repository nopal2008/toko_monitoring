import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const controlClass =
    'block w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:ring-danger/20';

export function Input({ className, ...props }: ComponentProps<'input'>) {
    return <input className={cn(controlClass, 'h-10', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
    return (
        <textarea
            className={cn(controlClass, 'min-h-[100px] resize-y py-2', className)}
            {...props}
        />
    );
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
    return (
        <select className={cn(controlClass, 'h-10', className)} {...props} />
    );
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
    return (
        <label
            className={cn('mb-1.5 block text-sm font-medium', className)}
            {...props}
        />
    );
}
