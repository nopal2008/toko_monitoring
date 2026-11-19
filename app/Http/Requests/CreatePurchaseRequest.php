<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string|\Stringable|ValidationRule|InvokableRule>|string|\Stringable|ValidationRule|InvokableRule>
     */
    public function rules(): array
    {
        return [
            'store_id' => ['required', 'integer', 'min:1'],
            'supplier_id' => ['nullable', 'integer', 'min:1'],
            'purchase_date' => ['required', 'date'],
            'status' => ['nullable', Rule::in(['draft', 'completed'])],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['required', 'integer', 'min:1'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100000'],
            'items.*.unit_cost' => ['required', 'decimal:0,2', 'max:9999999999999.99'],
        ];
    }

    /**
     * @return array{
     *     store_id: int,
     *     supplier_id?: int|null,
     *     purchase_date: string,
     *     status?: string,
     *     notes?: string|null,
     *     items: array<int, array{product_id: int, quantity: int, unit_cost: string|int|null}>
     * }
     */
    public function purchaseData(): array
    {
        $validated = $this->validated();
        $items = $validated['items'] ?? [];
        $notes = $validated['notes'] ?? null;
        $status = $validated['status'] ?? null;
        $supplierId = $validated['supplier_id'] ?? null;

        if (! is_array($items)) {
            throw new \LogicException('Validated purchase items must be an array.');
        }

        if ($notes !== null && ! is_string($notes)) {
            throw new \LogicException('Validated purchase notes must be a string or null.');
        }

        if ($status !== null && ! is_string($status)) {
            throw new \LogicException('Validated purchase status must be a string or null.');
        }

        if ($supplierId !== null && ! is_numeric($supplierId)) {
            throw new \LogicException('Validated purchase supplier ID must be numeric.');
        }

        $normalizedItems = [];

        foreach ($items as $item) {
            if (! is_array($item)
                || ! is_numeric($item['product_id'] ?? null)
                || ! is_numeric($item['quantity'] ?? null)
                || ! is_numeric($item['unit_cost'] ?? null)) {
                throw new \LogicException('Validated purchase item is invalid.');
            }

            $normalizedItems[] = [
                'product_id' => (int) $item['product_id'],
                'quantity' => (int) $item['quantity'],
                'unit_cost' => (string) $item['unit_cost'],
            ];
        }

        return [
            'store_id' => $this->integer('store_id'),
            'supplier_id' => $supplierId === null ? null : (int) $supplierId,
            'purchase_date' => $this->date('purchase_date')?->toDateString() ?? now()->toDateString(),
            'status' => $status,
            'notes' => $notes,
            'items' => $normalizedItems,
        ];
    }
}
