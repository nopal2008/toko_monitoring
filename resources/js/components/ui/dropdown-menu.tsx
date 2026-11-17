import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({
    className,
    sideOffset = 8,
    ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
    return (
        <DropdownMenuPrimitive.Portal>
            <DropdownMenuPrimitive.Content
                sideOffset={sideOffset}
                className={cn(
                    'z-50 min-w-56 rounded-xl border border-border bg-card p-1.5 text-card-foreground shadow-hover data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in',
                    className,
                )}
                {...props}
            />
        </DropdownMenuPrimitive.Portal>
    );
}

export function DropdownMenuItem({
    className,
    ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
    return (
        <DropdownMenuPrimitive.Item
            className={cn(
                'flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm outline-none select-none data-[highlighted]:bg-muted [&_svg]:size-4 [&_svg]:shrink-0',
                className,
            )}
            {...props}
        />
    );
}

export function DropdownMenuLabel({
    className,
    ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
    return (
        <DropdownMenuPrimitive.Label
            className={cn('px-2.5 py-2 text-sm', className)}
            {...props}
        />
    );
}

export function DropdownMenuSeparator({
    className,
    ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
    return (
        <DropdownMenuPrimitive.Separator
            className={cn('-mx-1.5 my-1.5 h-px bg-border', className)}
            {...props}
        />
    );
}
