import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const overlayClass =
    'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out';

export function DialogContent({
    className,
    children,
    ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className={overlayClass} />
            <DialogPrimitive.Content
                className={cn(
                    'fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-hover data-[state=closed]:animate-dialog-out data-[state=open]:animate-dialog-in',
                    className,
                )}
                {...props}
            >
                {children}
                <DialogPrimitive.Close
                    aria-label="Tutup"
                    className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none"
                >
                    <X className="size-4" aria-hidden="true" />
                </DialogPrimitive.Close>
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

/** Panel geser dari kiri, dipakai untuk menu navigasi di layar kecil. */
export function SheetContent({
    className,
    children,
    ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
    return (
        <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className={overlayClass} />
            <DialogPrimitive.Content
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border bg-card shadow-hover data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in',
                    className,
                )}
                {...props}
            >
                {children}
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    );
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn('pr-8', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div className={cn('mt-6 flex justify-end gap-2', className)} {...props} />
    );
}

export function DialogTitle({
    className,
    ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            className={cn('text-lg font-semibold text-foreground', className)}
            {...props}
        />
    );
}

export function DialogDescription({
    className,
    ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            className={cn('mt-1.5 text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}
