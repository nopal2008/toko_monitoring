import type { ReactNode } from 'react';

export function DescriptionList({
    items,
}: {
    items: { label: string; value: ReactNode }[];
}) {
    return (
        <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
                <div key={item.label}>
                    <dt className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                        {item.label}
                    </dt>
                    <dd className="mt-1.5 text-sm break-words text-foreground">
                        {item.value ?? '-'}
                    </dd>
                </div>
            ))}
        </dl>
    );
}
