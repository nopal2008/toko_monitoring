// Tipe di bawah mengikuti migration dan controller yang ada saat ini.

export type PageLink = {
    url: string | null;
    label: string;
    active: boolean;
};

/** Bentuk paginator Laravel yang dikirim langsung lewat Inertia::render(). */
export type Paginated<T> = {
    data: T[];
    links: PageLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

export type Store = {
    id: number;
    name: string;
    code: string;
    address: string | null;
    city: string | null;
    phone: string | null;
    latitude: string | null;
    longitude: string | null;
    radius_meter: number;
    opening_time: string | null;
    closing_time: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    users_count?: number;
    products_count?: number;
};

export type Category = {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    products_count?: number;
};

export type Supplier = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type CategoryOption = { id: number; name: string };

export type ProductStoreLink = {
    id: number;
    name: string;
    pivot: {
        tenant_id: number;
        price: string | null;
        min_stock: number | null;
        is_available: boolean | number;
    };
};

export type Product = {
    id: number;
    category_id: number | null;
    name: string;
    sku: string;
    barcode: string | null;
    unit: string;
    description: string | null;
    base_price: string;
    cost_price: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: CategoryOption | null;
    stores?: ProductStoreLink[];
};

export type DashboardPeriod = 'day' | 'week' | 'month';

export type DashboardProps = {
    kpi: {
        sales_today: string;
        transactions_today: number;
        low_stock_count: number;
        active_employees: number;
    };
    chart: { date: string; sales: string; transactions: number }[];
    period: DashboardPeriod;
    store_id: number | null;
};
