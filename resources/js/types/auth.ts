export type AuthUser = {
    id: number;
    name: string;
    email: string;
    tenant_id: number | null;
    avatar_path: string | null;
};

export type Auth = {
    user: AuthUser | null;
    roles: string[];
    permissions: string[];
};
