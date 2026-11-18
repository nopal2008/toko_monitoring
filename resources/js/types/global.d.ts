import type { Auth, ImpersonationContext } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            impersonation: ImpersonationContext;
            // Belum dibagikan oleh HandleInertiaRequests (lihat catatan gap).
            flash?: { success?: string | null; error?: string | null };
            [key: string]: unknown;
        };
    }
}
