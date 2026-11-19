import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import StockOpnameController from '@/actions/App/Http/Controllers/StockOpnameController';
import { SelectField, TextAreaField } from '@/components/fields';
import { Input } from '@/components/ui/input';
import { buttonClass, Card, PageHeader } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { formatNumber } from '@/lib/format';

type WarehouseOption = { id: number; name: string; store_id: number | null };

type InventoryRow = {
    id: number;
    store_id: number;
    product_id: number;
    quantity: string;
    product: {
        id: number;
        name: string;
        sku: string;
        unit: string;
    } | null;
};

type CountItem = {
    product_id: number;
    name: string;
    sku: string;
    unit: string;
    system_quantity: number;
    physical_quantity: string;
    notes: string;
    include: boolean;
};

function StockOpnamesCreate({
    warehouses,
    inventories,
}: {
    warehouses: WarehouseOption[];
    inventories: InventoryRow[];
}) {
    const form = useForm<{
        warehouse_id: string;
        notes: string;
        items: CountItem[];
    }>({
        warehouse_id: '',
        notes: '',
        items: [],
    });

    function selectWarehouse(warehouseId: string) {
        const warehouse = warehouses.find(
            (item) => String(item.id) === warehouseId,
        );
        const rows =
            warehouse?.store_id != null
                ? inventories.filter(
                      (inventory) =>
                          inventory.store_id === warehouse.store_id,
                  )
                : [];

        form.setData({
            ...form.data,
            warehouse_id: warehouseId,
            items: rows.map((row) => ({
                product_id: row.product_id,
                name: row.product?.name ?? `Produk #${row.product_id}`,
                sku: row.product?.sku ?? '-',
                unit: row.product?.unit ?? 'pcs',
                system_quantity: Number(row.quantity),
                physical_quantity: String(Number(row.quantity)),
                notes: '',
                include: false,
            })),
        });
    }

    function updateItem(
        productId: number,
        values: Partial<CountItem>,
    ) {
        form.setData({
            ...form.data,
            items: form.data.items.map((item) =>
                item.product_id === productId
                    ? { ...item, ...values }
                    : item,
            ),
        });
    }

    function toggleAll(include: boolean) {
        form.setData({
            ...form.data,
            items: form.data.items.map((item) => ({ ...item, include })),
        });
    }

    function submit(event: FormEvent) {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        form.transform((data) => ({
            warehouse_id: Number(data.warehouse_id),
            notes: data.notes,
            items: data.items
                .filter((item) => item.include)
                .map((item) => ({
                    product_id: item.product_id,
                    physical_quantity: Number(item.physical_quantity),
                    notes: item.notes || null,
                })),
        }));

        form.post(StockOpnameController.store.url());
    }

    const selectedCount = form.data.items.filter(
        (item) => item.include,
    ).length;

    return (
        <>
            <Head title="Stock opname baru" />
            <PageHeader
                title="Stock opname baru"
                description="Pilih gudang, lalu masukkan jumlah fisik produk yang dihitung."
            />
            <form onSubmit={submit} noValidate className="space-y-4">
                <Card className="space-y-4 p-6">
                    <SelectField
                        id="warehouse_id"
                        label="Gudang"
                        required
                        value={form.data.warehouse_id}
                        onChange={(event) =>
                            selectWarehouse(event.target.value)
                        }
                        error={form.errors.warehouse_id}
                    >
                        <option value="">Pilih gudang</option>
                        {warehouses.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </option>
                        ))}
                    </SelectField>
                    <TextAreaField
                        id="notes"
                        label="Catatan"
                        rows={3}
                        maxLength={2000}
                        value={form.data.notes}
                        onChange={(event) =>
                            form.setData('notes', event.target.value)
                        }
                        error={form.errors.notes}
                    />
                </Card>

                <Card>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">
                                Daftar produk
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {form.data.warehouse_id
                                    ? `${form.data.items.length} produk · ${selectedCount} dipilih`
                                    : 'Pilih gudang untuk memuat produk.'}
                            </p>
                        </div>
                        {form.data.items.length > 0 && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleAll(true)}
                                    className={buttonClass(
                                        'secondary',
                                        'h-8 px-2 text-xs',
                                    )}
                                >
                                    Pilih semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleAll(false)}
                                    className={buttonClass(
                                        'secondary',
                                        'h-8 px-2 text-xs',
                                    )}
                                >
                                    Kosongkan
                                </button>
                            </div>
                        )}
                    </div>
                    {form.data.items.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Belum ada produk yang dimuat.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[44rem] text-sm">
                                <thead className="bg-muted/50 text-left text-xs tracking-wider text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Pilih
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Produk
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Stok sistem
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Stok fisik
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Selisih
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {form.data.items.map((item) => {
                                        const difference =
                                            Number(item.physical_quantity) -
                                            item.system_quantity;

                                        return (
                                            <tr key={item.product_id}>
                                                <td className="px-4 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.include}
                                                        onChange={(event) =>
                                                            updateItem(
                                                                item.product_id,
                                                                {
                                                                    include:
                                                                        event
                                                                            .target
                                                                            .checked,
                                                                },
                                                            )
                                                        }
                                                        className="size-4 rounded border-border"
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <p className="font-medium">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.sku}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-2 text-right">
                                                    {formatNumber(
                                                        item.system_quantity,
                                                    )}{' '}
                                                    {item.unit}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        aria-label={`Stok fisik ${item.name}`}
                                                        value={
                                                            item.physical_quantity
                                                        }
                                                        onChange={(event) =>
                                                            updateItem(
                                                                item.product_id,
                                                                {
                                                                    physical_quantity:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    include: true,
                                                                },
                                                            )
                                                        }
                                                        className="w-28"
                                                    />
                                                </td>
                                                <td
                                                    className={`px-4 py-2 text-right font-medium ${
                                                        difference === 0
                                                            ? 'text-muted-foreground'
                                                            : difference > 0
                                                              ? 'text-emerald-600'
                                                              : 'text-danger-fg'
                                                    }`}
                                                >
                                                    {difference > 0 ? '+' : ''}
                                                    {formatNumber(difference)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {form.errors.items && (
                        <p className="px-4 pb-3 text-xs text-danger-fg">
                            {form.errors.items}
                        </p>
                    )}
                </Card>

                <div className="flex justify-end gap-2">
                    <Link
                        href={StockOpnameController.index.url()}
                        className={buttonClass('secondary')}
                    >
                        Batal
                    </Link>
                    <button
                        type="submit"
                        disabled={
                            form.processing ||
                            form.data.warehouse_id === '' ||
                            selectedCount === 0
                        }
                        className={buttonClass('primary')}
                    >
                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan penghitungan'}
                    </button>
                </div>
            </form>
        </>
    );
}

StockOpnamesCreate.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default StockOpnamesCreate;
