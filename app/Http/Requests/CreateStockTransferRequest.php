<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateStockTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string|\Stringable|ValidationRule|InvokableRule>|string|\Stringable|ValidationRule|InvokableRule> */
    public function rules(): array
    {
        return [
            'from_store_id' => ['required', 'integer', 'min:1'],
            'to_store_id' => ['required', 'integer', 'different:from_store_id', 'min:1'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => ['required', 'integer', 'min:1', 'distinct'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array{
     *     from_store_id: int,
     *     to_store_id: int,
     *     items: array<int, array{product_id: int, quantity: int}>,
     *     notes?: string|null
     * }
     */
    public function transferData(): array
    {
        $validated = $this->validated();
        $items = $validated['items'] ?? null;
        $notes = $validated['notes'] ?? null;

        if (! is_array($items)) {
            throw new \LogicException('Validated transfer items must be an array.');
        }

        if ($notes !== null && ! is_string($notes)) {
            throw new \LogicException('Validated transfer notes must be a string or null.');
        }

        $normalizedItems = [];

        foreach ($items as $item) {
            if (! is_array($item)
                || ! is_numeric($item['product_id'] ?? null)
                || ! is_numeric($item['quantity'] ?? null)) {
                throw new \LogicException('Validated transfer item is invalid.');
            }

            $normalizedItems[] = [
                'product_id' => (int) $item['product_id'],
                'quantity' => (int) $item['quantity'],
            ];
        }

        return [
            'from_store_id' => $this->integer('from_store_id'),
            'to_store_id' => $this->integer('to_store_id'),
            'items' => $normalizedItems,
            'notes' => $notes,
        ];
    }
}
