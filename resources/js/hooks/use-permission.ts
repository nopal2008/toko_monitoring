import { usePage } from '@inertiajs/react';

/**
 * Hook untuk mengecek izin dan role user.
 * Hanya untuk menyembunyikan/menampilkan UI — backend tetap penentu izin sesungguhnya.
 */
export function usePermission() {
    const { auth } = usePage().props;

    /** Cek satu permission. */
    const can = (permission: string) => auth.permissions.includes(permission);

    /** Cek apakah user memiliki salah satu dari beberapa permission. */
    const canAny = (permissions: string[]) =>
        permissions.some((p) => auth.permissions.includes(p));

    /** Cek satu role. */
    const hasRole = (role: string) => auth.roles.includes(role);

    /** Cek apakah user memiliki salah satu dari beberapa role. */
    const hasAnyRole = (...roles: string[]) =>
        roles.some((role) => auth.roles.includes(role));

    return { can, canAny, hasRole, hasAnyRole };
}
