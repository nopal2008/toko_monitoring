<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string|\Stringable|ValidationRule|InvokableRule>|string|\Stringable|ValidationRule|InvokableRule> */
    public function rules(): array
    {
        return [
            'store_id' => ['required', 'integer', 'min:1'],
            'cashier_shift_id' => ['nullable', 'integer', 'min:1'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['required', 'integer', 'min:1', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100000'],
            'items.*.discount_amount' => ['nullable', 'decimal:0,2', 'max:9999999999999.99'],
            'discount_amount' => ['nullable', 'decimal:0,2', 'max:9999999999999.99'],
            'tax_amount' => ['nullable', 'decimal:0,2', 'max:9999999999999.99'],
            'paid_amount' => ['required', 'decimal:0,2', 'max:9999999999999.99'],
            'payment_method' => ['required', 'in:cash,card,transfer,other'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array{
     *     store_id: int,
     *     items: array<int, array{product_id: int, quantity: int, discount_amount?: string|int|null}>,
     *     discount_amount?: string|int|null,
     *     tax_amount?: string|int|null,
     *     paid_amount: string,
     *     payment_method: string,
     *     cashier_shift_id?: int|null,
     *     notes?: string|null
     * }
     */
    public function transactionData(): array
    {
        $validated = $this->validated();
        $items = $validated['items'] ?? null;
        $notes = $validated['notes'] ?? null;

        if (! is_array($items)) {
            throw new \LogicException('Validated transaction items must be an array.');
        }

        if ($notes !== null && ! is_string($notes)) {
            throw new \LogicException('Validated transaction notes must be a string or null.');
        }

        $normalizedItems = [];

        foreach ($items as $item) {
            if (! is_array($item)
                || ! is_numeric($item['product_id'] ?? null)
                || ! is_numeric($item['quantity'] ?? null)) {
                throw new \LogicException('Validated transaction item is invalid.');
            }

            $normalizedItem = [
                'product_id' => (int) $item['product_id'],
                'quantity' => (int) $item['quantity'],
            ];
            $discount = $item['discount_amount'] ?? null;

            if ($discount !== null) {
                if (! is_string($discount) && ! is_int($discount)) {
                    throw new \LogicException('Validated item discount must be numeric.');
                }

                $normalizedItem['discount_amount'] = $discount;
            }

            $normalizedItems[] = $normalizedItem;
        }

        $discount = $validated['discount_amount'] ?? null;
        $tax = $validated['tax_amount'] ?? null;
        $cashierShiftId = $validated['cashier_shift_id'] ?? null;

        if (($discount !== null && ! is_string($discount) && ! is_int($discount))
            || ($tax !== null && ! is_string($tax) && ! is_int($tax))) {
            throw new \LogicException('Validated transaction amounts must be numeric.');
        }

        if ($cashierShiftId !== null && ! is_numeric($cashierShiftId)) {
            throw new \LogicException('Validated cashier shift ID must be numeric.');
        }

        return [
            'store_id' => $this->integer('store_id'),
            'items' => $normalizedItems,
            'discount_amount' => $discount,
            'tax_amount' => $tax,
            'paid_amount' => $this->string('paid_amount')->toString(),
            'payment_method' => $this->string('payment_method')->toString(),
            'cashier_shift_id' => $cashierShiftId === null ? null : (int) $cashierShiftId,
            'notes' => $notes,
        ];
    }
}
