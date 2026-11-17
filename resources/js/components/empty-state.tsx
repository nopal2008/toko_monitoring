import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

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
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center lg:py-20">
            <Inbox
                className="size-16 text-muted-foreground/40"
                strokeWidth={1.25}
                aria-hidden="true"
            />
            <p className="mt-2 text-lg font-medium text-foreground">{title}</p>
            {description && (
                <p className="max-w-md text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            {action && <div className="mt-3">{action}</div>}
        </div>
    );
}
