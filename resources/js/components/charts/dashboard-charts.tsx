import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatCurrency, formatDateOnly, formatNumber } from '@/lib/format';

export type ChartRow = { date: string; sales: number; transactions: number };
export type AttendanceChartRow = {
    date: string;
    present: number;
    late: number;
};
export type StoreChartRow = {
    name: string;
    sales: number;
    transactions: number;
};
export type DistributionChartRow = { label: string; transactions: number };

const compact = new Intl.NumberFormat('id-ID', { notation: 'compact' });

const axisTick = { fontSize: 12, fill: 'hsl(var(--muted-foreground))' };

type TooltipEntry = { value?: number; payload?: { date: string } };

function ChartTooltip({
    active,
    payload,
    kind,
}: {
    active?: boolean;
    payload?: TooltipEntry[];
    kind: 'currency' | 'number';
}) {
    const entry = payload?.[0];

    if (!active || !entry || entry.value === undefined) {
        return null;
    }

    return (
        <div className="rounded-xl border border-border bg-card p-3 text-xs shadow-hover">
            <p className="text-muted-foreground">
                {entry.payload ? formatDateOnly(entry.payload.date) : ''}
            </p>
            <p className="mt-1 font-mono text-sm font-medium text-foreground tabular-nums">
                {kind === 'currency'
                    ? formatCurrency(entry.value)
                    : formatNumber(entry.value)}
            </p>
        </div>
    );
}

export function SalesTrendChart({ data }: { data: ChartRow[] }) {
    return (
        <div className="h-72 w-full lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="sales-fill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="hsl(var(--brand-500))"
                                stopOpacity={0.3}
                            />
                            <stop
                                offset="100%"
                                stopColor="hsl(var(--brand-500))"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDateOnly}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={24}
                    />
                    <YAxis
                        width={56}
                        tickFormatter={(value: number) => compact.format(value)}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        content={<ChartTooltip kind="currency" />}
                        cursor={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="hsl(var(--brand-500))"
                        strokeWidth={2}
                        fill="url(#sales-fill)"
                        dot={data.length < 3}
                        animationDuration={800}
                        animationEasing="ease-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function TransactionsChart({ data }: { data: ChartRow[] }) {
    return (
        <div className="h-72 w-full lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                    <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDateOnly}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={24}
                    />
                    <YAxis
                        width={40}
                        allowDecimals={false}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        content={<ChartTooltip kind="number" />}
                        cursor={{ fill: 'hsl(var(--muted))' }}
                    />
                    <Bar
                        dataKey="transactions"
                        fill="hsl(var(--brand-400))"
                        radius={[6, 6, 0, 0]}
                        animationDuration={600}
                        animationEasing="ease-out"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function AttendanceTrendChart({ data }: { data: AttendanceChartRow[] }) {
    return (
        <div className="h-72 w-full lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                    <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDateOnly}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={24}
                    />
                    <YAxis
                        width={36}
                        allowDecimals={false}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip kind="number" />} />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="present"
                        name="Hadir"
                        stroke="hsl(var(--brand-500))"
                        fill="hsl(var(--brand-500))"
                        fillOpacity={0.15}
                        strokeWidth={2}
                    />
                    <Area
                        type="monotone"
                        dataKey="late"
                        name="Terlambat"
                        stroke="hsl(var(--warning))"
                        fill="hsl(var(--warning))"
                        fillOpacity={0.1}
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function StoreSalesChart({ data }: { data: StoreChartRow[] }) {
    return (
        <div className="h-72 w-full lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                    <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        width={56}
                        tickFormatter={(value: number) => compact.format(value)}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar
                        dataKey="sales"
                        name="Penjualan"
                        fill="hsl(var(--brand-500))"
                        radius={[6, 6, 0, 0]}
                        animationDuration={600}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function DistributionChart({ data }: { data: DistributionChartRow[] }) {
    return (
        <div className="h-72 w-full lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                    <CartesianGrid
                        stroke="hsl(var(--border))"
                        strokeDasharray="3 3"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="label"
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        width={40}
                        allowDecimals={false}
                        tick={axisTick}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(value: number) => formatNumber(value)}
                    />
                    <Bar
                        dataKey="transactions"
                        name="Transaksi"
                        fill="hsl(var(--brand-400))"
                        radius={[6, 6, 0, 0]}
                        animationDuration={600}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
