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

export type Area = {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    stores_count?: number;
    warehouses_count?: number;
};

export type Warehouse = {
    id: number;
    tenant_id: number;
    store_id: number | null;
    name: string;
    code: string;
    type: string;
    address: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    store?: { id: number; name: string } | null;
};

export type Brand = {
    id: number;
    tenant_id: number;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    products_count?: number;
};

export type Unit = {
    id: number;
    tenant_id: number | null;
    name: string;
    symbol: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
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
    image_path: string | null;
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
    role: string;
    kpi: {
        sales_today: string;
        transactions_today: number;
        low_stock_count: number;
        active_employees: number;
        active_stores: number;
        late_attendance_today: number;
        staff_days_this_month: number;
        staff_late_days_this_month: number;
        staff_work_minutes_today: number;
        average_transaction: string;
    };
    chart: { date: string; sales: string; transactions: number }[];
    attendance_chart: { date: string; present: number; late: number }[];
    store_chart: { name: string; sales: string; transactions: number }[];
    payment_chart: { label: string; transactions: number }[];
    period: DashboardPeriod;
    store_id: number | null;
    stores: { id: number; name: string }[];
};
