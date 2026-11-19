<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateTransactionRequest extends FormRequest
{
    public const PAYMENT_METHODS = ['cash', 'debit', 'credit', 'card', 'qris', 'ewallet', 'transfer', 'other'];

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
            'payments' => ['sometimes', 'array', 'min:1', 'max:5'],
            'payments.*.method' => ['required', Rule::in(self::PAYMENT_METHODS)],
            'payments.*.amount' => ['required', 'decimal:0,2', 'max:9999999999999.99'],
            'payments.*.reference_number' => ['nullable', 'string', 'max:100'],
            'discount_amount' => ['nullable', 'decimal:0,2', 'max:9999999999999.99'],
            'tax_amount' => ['nullable', 'decimal:0,2', 'max:9999999999999.99'],
            'paid_amount' => ['required_without:payments', 'nullable', 'decimal:0,2', 'max:9999999999999.99'],
            'payment_method' => ['required_without:payments', 'nullable', Rule::in(self::PAYMENT_METHODS)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array{
     *     store_id: int,
     *     items: array<int, array{product_id: int, quantity: int, discount_amount?: string|int|null}>,
     *     payments: array<int, array{method: string, amount: string|int, reference_number?: string|null}>,
     *     discount_amount?: string|int|null,
     *     tax_amount?: string|int|null,
     *     paid_amount?: string|null,
     *     payment_method?: string|null,
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

        $payments = [];
        $rawPayments = $validated['payments'] ?? [];

        foreach ($rawPayments as $payment) {
            if (! is_array($payment) || ! is_string($payment['method'] ?? null)) {
                throw new \LogicException('Validated payment is invalid.');
            }

            $amount = $payment['amount'] ?? null;

            if (! is_string($amount) && ! is_int($amount)) {
                throw new \LogicException('Validated payment amount must be numeric.');
            }

            $payments[] = [
                'method' => $payment['method'],
                'amount' => $amount,
                'reference_number' => isset($payment['reference_number']) && is_string($payment['reference_number'])
                    ? $payment['reference_number']
                    : null,
            ];
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
            'payments' => $payments,
            'discount_amount' => $discount,
            'tax_amount' => $tax,
            'paid_amount' => $validated['paid_amount'] ?? null,
            'payment_method' => $validated['payment_method'] ?? null,
            'cashier_shift_id' => $cashierShiftId === null ? null : (int) $cashierShiftId,
            'notes' => $notes,
        ];
    }
}
