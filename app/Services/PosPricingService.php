<?php

namespace App\Services;

use App\Models\Inventory;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\Setting;
use App\Support\MoneyAmount;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PosPricingService
{
    /**
     * @param  array<int, array{product_id: int, quantity: int, discount_amount?: string|int|null}>  $items
     * @param  EloquentCollection<int, Product>|null  $products
     * @param  EloquentCollection<int, Inventory>|null  $inventories
     * @return array{
     *     items: array<int, array{
     *         product: Product,
     *         inventory: Inventory,
     *         quantity: int,
     *         unit_price: int,
     *         price: string,
     *         gross: int,
     *         discount: int,
     *         subtotal: int,
     *         promotion_name: string|null
     *     }>,
     *     subtotal: int,
     *     discount: int,
     *     tax: int,
     *     total: int,
     *     tax_percentage: string,
     *     promotion_names: array<int, string>
     * }
     */
    public function quote(
        int $tenantId,
        int $storeId,
        array $items,
        ?EloquentCollection $products = null,
        ?EloquentCollection $inventories = null,
        string|int|null $manualDiscount = null,
        string|int|null $taxAmount = null,
    ): array {
        $productIds = collect($items)->pluck('product_id')->unique()->sort()->values();

        $products ??= Product::query()->whereIn('id', $productIds)->get()->keyBy('id');
        $inventories ??= Inventory::query()
            ->where('store_id', $storeId)
            ->whereIn('product_id', $productIds)
            ->orderBy('product_id')
            ->lockForUpdate()
            ->get()
            ->keyBy('product_id');

        /** @var array<int, array{price: string|null, wholesale_price: string|null, wholesale_min_qty: int|null, is_available: bool}> $storeProducts */
        $storeProducts = DB::table('product_store')
            ->where('tenant_id', $tenantId)
            ->where('store_id', $storeId)
            ->whereIn('product_id', $productIds)
            ->get()
            ->keyBy('product_id')
            ->map(fn (object $row): array => [
                'price' => $row->price,
                'wholesale_price' => $row->wholesale_price ?? null,
                'wholesale_min_qty' => $row->wholesale_min_qty ?? null,
                'is_available' => (bool) $row->is_available,
            ])
            ->all();

        $promotions = Promotion::query()
            ->activeNow()
            ->where('tenant_id', $tenantId)
            ->where(fn ($query) => $query->whereNull('store_id')->orWhere('store_id', $storeId))
            ->where(fn ($query) => $query->whereNull('product_id')->orWhereIn('product_id', $productIds))
            ->get();

        $promotionNames = [];
        $pricedItems = [];
        $subtotal = 0;
        $itemDiscountTotal = 0;

        foreach ($items as $item) {
            $product = $products->get($item['product_id']);
            $inventory = $inventories->get($item['product_id']);
            $storeProduct = $storeProducts[$item['product_id']] ?? null;

            if ($product === null || $inventory === null) {
                throw ValidationException::withMessages([
                    'items' => 'Produk tidak tersedia pada cabang ini.',
                ]);
            }

            if ($storeProduct !== null && ! $storeProduct['is_available']) {
                throw ValidationException::withMessages([
                    'items' => "Produk {$product->name} tidak tersedia di cabang ini.",
                ]);
            }

            if ($inventory->quantity - $inventory->reserved_quantity < $item['quantity']) {
                throw ValidationException::withMessages([
                    'items' => "Stok {$product->name} tidak mencukupi.",
                ]);
            }

            $unitPrice = $this->unitPriceFor($product, $storeProduct, $item['quantity']);
            $gross = $unitPrice * $item['quantity'];
            [$promotionDiscount, $promotionName] = $this->bestProductPromotion(
                $promotions,
                (int) $product->id,
                $item['quantity'],
                $unitPrice,
                $gross,
            );

            if ($promotionName !== null) {
                $promotionNames[] = $promotionName;
            }

            $manualLineDiscount = MoneyAmount::toMinorUnits($item['discount_amount'] ?? 0);
            $discount = min($gross, $promotionDiscount + $manualLineDiscount);

            if ($manualLineDiscount > $gross) {
                throw ValidationException::withMessages([
                    'items' => 'Diskon item tidak boleh melebihi subtotal item.',
                ]);
            }

            $lineSubtotal = $gross - $discount;
            $subtotal += $gross;
            $itemDiscountTotal += $discount;

            $pricedItems[] = [
                'product' => $product,
                'inventory' => $inventory,
                'quantity' => $item['quantity'],
                'unit_price' => $unitPrice,
                'price' => MoneyAmount::fromMinorUnits($unitPrice),
                'gross' => $gross,
                'discount' => $discount,
                'subtotal' => $lineSubtotal,
                'promotion_name' => $promotionName,
            ];
        }

        $afterItemDiscount = $subtotal - $itemDiscountTotal;
        [$billPromotionDiscount, $billPromotionName] = $this->bestBillPromotion($promotions, $afterItemDiscount);

        if ($billPromotionName !== null) {
            $promotionNames[] = $billPromotionName;
        }

        $manualDiscount = MoneyAmount::toMinorUnits($manualDiscount ?? 0);

        if ($manualDiscount > $afterItemDiscount) {
            throw ValidationException::withMessages([
                'discount_amount' => 'Diskon transaksi tidak boleh melebihi subtotal.',
            ]);
        }

        $discount = min($afterItemDiscount, $itemDiscountTotal + $billPromotionDiscount + $manualDiscount);
        $taxPercentage = $this->taxPercentage($tenantId);
        $taxBase = max(0, $subtotal - $discount);
        $tax = $taxAmount !== null
            ? MoneyAmount::toMinorUnits($taxAmount)
            : intdiv($taxBase * (int) round(((float) $taxPercentage) * 100), 10000);

        return [
            'items' => $pricedItems,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'total' => $taxBase + $tax,
            'tax_percentage' => $taxPercentage,
            'promotion_names' => array_values(array_unique($promotionNames)),
        ];
    }

    /**
     * @param  array{price: string|null, wholesale_price: string|null, wholesale_min_qty: int|null}|null  $storeProduct
     */
    public function unitPriceFor(Product $product, ?array $storeProduct, int $quantity): int
    {
        if ($storeProduct !== null) {
            $wholesaleMinQty = (int) ($storeProduct['wholesale_min_qty'] ?? 0);

            if ($storeProduct['wholesale_price'] !== null && $wholesaleMinQty > 0 && $quantity >= $wholesaleMinQty) {
                return MoneyAmount::toMinorUnits($storeProduct['wholesale_price']);
            }

            if ($storeProduct['price'] !== null) {
                return MoneyAmount::toMinorUnits($storeProduct['price']);
            }
        }

        return MoneyAmount::toMinorUnits((string) $product->base_price);
    }

    /**
     * @param  EloquentCollection<int, Promotion>  $promotions
     * @return array{0: int, 1: string|null}
     */
    private function bestProductPromotion(
        EloquentCollection $promotions,
        int $productId,
        int $quantity,
        int $unitPrice,
        int $gross,
    ): array {
        $bestDiscount = 0;
        $bestName = null;

        foreach ($promotions->where('product_id', $productId) as $promotion) {
            $discount = $this->promotionDiscount($promotion, $quantity, $unitPrice, $gross);

            if ($discount > $bestDiscount) {
                $bestDiscount = $discount;
                $bestName = $promotion->name;
            }
        }

        return [$bestDiscount, $bestName];
    }

    /**
     * @param  EloquentCollection<int, Promotion>  $promotions
     * @return array{0: int, 1: string|null}
     */
    private function bestBillPromotion(EloquentCollection $promotions, int $base): array
    {
        $bestDiscount = 0;
        $bestName = null;

        foreach ($promotions->whereNull('product_id') as $promotion) {
            if ($promotion->type === Promotion::TYPE_BOGO) {
                continue;
            }

            $minPurchase = MoneyAmount::toMinorUnits((string) $promotion->min_purchase);

            if ($base < $minPurchase) {
                continue;
            }

            $discount = match ($promotion->type) {
                Promotion::TYPE_PERCENT => intdiv($base * MoneyAmount::toMinorUnits((string) $promotion->value), 10000),
                Promotion::TYPE_FIXED => MoneyAmount::toMinorUnits((string) $promotion->value),
                default => 0,
            };
            $discount = min($base, $discount);

            if ($discount > $bestDiscount) {
                $bestDiscount = $discount;
                $bestName = $promotion->name;
            }
        }

        return [$bestDiscount, $bestName];
    }

    private function promotionDiscount(Promotion $promotion, int $quantity, int $unitPrice, int $gross): int
    {
        $discount = match ($promotion->type) {
            Promotion::TYPE_PERCENT => intdiv($gross * MoneyAmount::toMinorUnits((string) $promotion->value), 10000),
            Promotion::TYPE_FIXED => MoneyAmount::toMinorUnits((string) $promotion->value),
            Promotion::TYPE_BOGO => $this->bogoDiscount($promotion, $quantity, $unitPrice),
            default => 0,
        };

        return max(0, min($gross, $discount));
    }

    private function bogoDiscount(Promotion $promotion, int $quantity, int $unitPrice): int
    {
        $buyQuantity = max(1, (int) ($promotion->buy_quantity ?? 0));
        $freeQuantity = max(0, (int) ($promotion->free_quantity ?? 0));

        if ($freeQuantity === 0) {
            return 0;
        }

        $freeUnits = min($quantity, intdiv($quantity, $buyQuantity) * $freeQuantity);

        return $freeUnits * $unitPrice;
    }

    private function taxPercentage(int $tenantId): string
    {
        $value = Setting::query()
            ->where('tenant_id', $tenantId)
            ->where('setting_group', 'receipt')
            ->where('setting_key', 'tax_percentage')
            ->value('value');

        if (is_array($value)) {
            $value = $value['value'] ?? $value[0] ?? null;
        }

        if (! is_numeric($value)) {
            return '0.00';
        }

        return number_format(max(0, (float) $value), 2, '.', '');
    }
}
