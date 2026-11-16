<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreateExpenseRequest extends FormRequest
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
            'expense_category_id' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'decimal:0,2', 'gt:0', 'max:9999999999999.99'],
            'expense_date' => ['required', 'date'],
            'payment_method' => ['required', 'in:cash,card,transfer,other'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'attachment' => ['nullable', 'file', 'max:2048'],
        ];
    }

    /**
     * @return array{
     *     store_id: int,
     *     expense_category_id: int,
     *     title: string,
     *     amount: string,
     *     expense_date: string,
     *     payment_method: string,
     *     notes?: string|null
     * }
     */
    public function expenseData(): array
    {
        $validated = $this->validated();
        $notes = $validated['notes'] ?? null;

        if ($notes !== null && ! is_string($notes)) {
            throw new \LogicException('Validated expense notes must be a string or null.');
        }

        return [
            'store_id' => $this->integer('store_id'),
            'expense_category_id' => $this->integer('expense_category_id'),
            'title' => $this->string('title')->toString(),
            'amount' => $this->string('amount')->toString(),
            'expense_date' => $this->string('expense_date')->toString(),
            'payment_method' => $this->string('payment_method')->toString(),
            'notes' => $notes,
        ];
    }
}
