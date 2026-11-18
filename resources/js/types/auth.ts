export type AuthUser = {
    id: number;
    name: string;
    email: string;
    tenant_id: number | null;
    avatar_path: string | null;
};

export type AuthStore = {
    id: number;
    name: string;
    code: string;
};

export type Auth = {
    user: AuthUser | null;
    roles: string[];
    permissions: string[];
    stores: AuthStore[];
};

export type ImpersonationContext = {
    actor: Pick<AuthUser, 'id' | 'name'> | null;
} | null;
