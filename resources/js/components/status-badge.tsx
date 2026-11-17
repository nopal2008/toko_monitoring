import { Badge } from '@/components/ui/badge';

/** Label status dari kolom `is_active` (atau `is_available`) di database. */
export function StatusBadge({
    active,
    activeLabel = 'Aktif',
    inactiveLabel = 'Nonaktif',
}: {
    active: boolean | number;
    activeLabel?: string;
    inactiveLabel?: string;
}) {
    return (
        <Badge variant={active ? 'success' : 'muted'}>
            {active ? activeLabel : inactiveLabel}
        </Badge>
    );
}
