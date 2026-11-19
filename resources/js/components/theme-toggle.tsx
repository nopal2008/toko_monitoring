import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

export function ThemeToggle() {
    const { theme, toggle } = useTheme();
    const dark = theme === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
        >
            {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button>
    );
}
