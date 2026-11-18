import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

/**
 * Polling Inertia untuk memperbarui sebagian prop secara berkala.
 * Polling dihentikan otomatis saat tab tidak aktif (visibilityState = 'hidden').
 *
 * @param intervalMs Interval polling dalam milidetik (default: 30 detik).
 * @param only Daftar prop yang di-reload — jangan reload seluruh halaman.
 */
export function usePolling(intervalMs = 30_000, only: string[] = []) {
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    // Gunakan string agar deps array stabil tanpa spread array.
    const onlyKey = only.join(',');

    useEffect(() => {
        const tick = () => {
            if (document.visibilityState === 'visible') {
                router.reload({ only: only.length > 0 ? only : undefined });
            }
            timer.current = setTimeout(tick, intervalMs);
        };

        timer.current = setTimeout(tick, intervalMs);

        return () => clearTimeout(timer.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intervalMs, onlyKey]);
}
