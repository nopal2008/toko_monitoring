/**
 * Komponen pembungkus permission — render children hanya jika user punya izin.
 * Fallback bisa berupa null atau elemen apapun.
 */
import { usePermission } from '@/hooks/use-permission';

type PermissionGateProps = {
    /** Permission yang dibutuhkan (satu). */
    permission?: string;
    /** Role yang dibutuhkan (satu). */
    role?: string;
    children: React.ReactNode;
    /** Konten fallback jika tidak punya izin (default: null). */
    fallback?: React.ReactNode;
};

export function PermissionGate({
    permission,
    role,
    children,
    fallback = null,
}: PermissionGateProps) {
    const { can, hasRole } = usePermission();

    const allowed =
        (permission ? can(permission) : true) && (role ? hasRole(role) : true);

    return allowed ? <>{children}</> : <>{fallback}</>;
}
