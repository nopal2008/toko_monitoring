import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';

/**
 * Menampilkan flash success/error dari Laravel. Membutuhkan prop bersama
 * `flash.success` / `flash.error` dari HandleInertiaRequests; tanpa itu
 * komponen ini tidak menampilkan apa pun.
 */
export function FlashMessage() {
    const { flash } = usePage().props;
    const items = [
        { kind: 'success', text: flash?.success },
        { kind: 'error', text: flash?.error },
    ].filter((item): item is { kind: string; text: string } =>
        Boolean(item.text),
    );

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="mb-4 space-y-2">
            {items.map((item) => (
                <div
                    key={item.kind}
                    role={item.kind === 'error' ? 'alert' : 'status'}
                    className={cn(
                        'rounded-md border px-4 py-3 text-sm',
                        item.kind === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-red-200 bg-red-50 text-red-900',
                    )}
                >
                    {item.text}
                </div>
            ))}
        </div>
    );
}
