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

export type PurchaseItem = {
    id: number;
    purchase_id: number;
    product_id: number;
    quantity: number;
    unit_cost: string;
    subtotal: string;
    product?: { id: number; name: string; sku: string; unit: string } | null;
};

export type Purchase = {
    id: number;
    store_id: number;
    supplier_id: number | null;
    invoice_number: string;
    purchase_date: string;
    total_amount: string;
    status: string;
    notes: string | null;
    created_by: number | null;
    received_at: string | null;
    created_at: string;
    updated_at: string;
    store?: { id: number; name: string } | null;
    supplier?: { id: number; name: string } | null;
    createdBy?: { id: number; name: string } | null;
    items?: PurchaseItem[];
};
export type CategoryOption = { id: number; name: string };

export type ProductStoreLink = {
    id: number;
    name: string;
    pivot: {
        tenant_id: number;
        price: string | null;
        wholesale_price: string | null;
        wholesale_min_qty: number | null;
        min_stock: number | null;
        is_available: boolean | number;
    };
};

export type PosProduct = Product & {
    unit_price: number;
    price: string;
    stock: number;
    min_stock: number;
    wholesale_price: string | null;
    wholesale_min_qty: number | null;
};

export type PosHold = {
    id: number;
    label: string;
    created_at: string;
    items: Array<{ product: PosProduct; quantity: number }>;
};

export type Promotion = {
    id: number;
    store_id: number | null;
    product_id: number | null;
    name: string;
    type: 'percent' | 'fixed' | 'bogo';
    value: string;
    buy_quantity: number | null;
    free_quantity: number | null;
    min_purchase: string;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    store?: { id: number; name: string } | null;
    product?: { id: number; name: string; sku: string } | null;
};

export type TransactionPayment = {
    id: number;
    method: string;
    amount: string;
    reference_number: string | null;
    paid_at: string | null;
};

export type StockOpname = {
    id: number;
    warehouse_id: number;
    reference: string;
    status: 'draft' | 'counting' | 'submitted' | 'approved' | 'rejected' | 'completed';
    counted_by: number;
    approved_by: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    warehouse?: { id: number; name: string; store_id: number | null } | null;
    counter?: { id: number; name: string } | null;
    approver?: { id: number; name: string } | null;
    items?: Array<{
        id: number;
        product_id: number;
        system_quantity: string;
        physical_quantity: string;
        difference: string;
        notes: string | null;
        product?: { id: number; name: string; sku: string; unit: string } | null;
    }>;
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

