import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 ease-out focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                primary:
                    'bg-primary text-primary-foreground shadow-soft hover:bg-primary/90 hover:shadow-hover',
                secondary:
                    'border border-border bg-muted text-foreground hover:bg-muted/80',
                ghost: 'text-foreground hover:bg-muted',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline:
                    'border border-border bg-transparent text-foreground hover:bg-muted',
            },
            size: {
                sm: 'h-9 px-3',
                default: 'h-10 px-4',
                lg: 'h-11 px-5',
                icon: 'size-10',
            },
        },
        defaultVariants: { variant: 'primary', size: 'default' },
    },
);

type ButtonProps = ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        loading?: boolean;
    };

export function Button({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    disabled,
    type = 'button',
    children,
    ...props
}: ButtonProps) {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (asChild) {
        return (
            <Slot className={classes} {...props}>
                {children}
            </Slot>
        );
    }

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
            {children}
        </button>
    );
}

type LegacyVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

/** Kelas tombol untuk elemen `Link` Inertia agar tampilannya sama dengan Button. */
export function buttonClass(variant: LegacyVariant = 'primary', className = '') {
    return cn(
        buttonVariants({
            variant: variant === 'danger' ? 'destructive' : variant,
        }),
        className,
    );
}
