import { usePage } from '@inertiajs/react';

/**
 * Hanya untuk mengatur tampilan. Backend tetap penentu izin yang sebenarnya.
 */
export function useAuth() {
    const { auth } = usePage().props;

    return {
        user: auth.user,
        roles: auth.roles,
        permissions: auth.permissions,
        can: (permission: string) => auth.permissions.includes(permission),
        hasAnyRole: (...roles: string[]) =>
            roles.some((role) => auth.roles.includes(role)),
    };
}
