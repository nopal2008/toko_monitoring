import { useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

// Sumber kebenaran tema adalah class `dark` pada <html>; script di app.blade.php
// menetapkannya sebelum render sehingga tidak ada kedipan tema salah.
function subscribe(callback: () => void) {
    const observer = new MutationObserver(callback);

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });

    return () => observer.disconnect();
}

function getSnapshot(): Theme {
    return document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light';
}

function getServerSnapshot(): Theme {
    return 'light';
}

export function useTheme() {
    const theme = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    const setTheme = useCallback((next: Theme) => {
        document.documentElement.classList.toggle('dark', next === 'dark');

        try {
            localStorage.setItem('theme', next);
        } catch {
            // Penyimpanan browser tidak tersedia; tema tetap berlaku untuk sesi ini.
        }
    }, []);

    const toggle = useCallback(() => {
        setTheme(getSnapshot() === 'dark' ? 'light' : 'dark');
    }, [setTheme]);

    return { theme, setTheme, toggle };
}
