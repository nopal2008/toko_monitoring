const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
});

const numberFormatter = new Intl.NumberFormat('id-ID');

export function formatCurrency(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    const amount = Number(value);

    return Number.isFinite(amount) ? currencyFormatter.format(amount) : '-';
}

export function formatNumber(value: number | string | null | undefined) {
    const amount = Number(value);

    return Number.isFinite(amount) ? numberFormatter.format(amount) : '-';
}

// Timezone tenant belum dibagikan sebagai shared prop, jadi zona waktu
// ditentukan lewat parameter (default Asia/Jakarta).
export function formatDateTime(
    value: string | null | undefined,
    timeZone = 'Asia/Jakarta',
) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone,
    }).format(date);
}

/** Tanggal murni (YYYY-MM-DD) tanpa konversi zona waktu. */
export function formatDateOnly(value: string) {
    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return value;
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        timeZone: 'UTC',
    }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function trimTime(value: string | null | undefined) {
    return value ? value.slice(0, 5) : '';
}
