import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { useTheme } from '@/hooks/use-theme';

/**
 * Menampilkan flash success/error dari Laravel sebagai toast. Membutuhkan
 * shared prop `flash.success` / `flash.error` dari HandleInertiaRequests;
 * tanpa itu tidak ada toast yang muncul.
 */
export function FlashToaster() {
    const { flash } = usePage().props;
    const { theme } = useTheme();
    const success = flash?.success;
    const error = flash?.error;

    useEffect(() => {
        if (success) {
            toast.success(success);
        }

        if (error) {
            toast.error(error, { duration: 6000 });
        }
    }, [success, error]);

    return (
        <Toaster
            richColors
            position="top-right"
            theme={theme}
            toastOptions={{
                classNames: {
                    toast: 'rounded-xl border border-border shadow-hover',
                },
            }}
        />
    );
}
