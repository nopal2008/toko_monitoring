<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CloseCashierShiftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string|\Stringable|ValidationRule|InvokableRule>|string|\Stringable|ValidationRule|InvokableRule> */
    public function rules(): array
    {
        return [
            'closing_cash' => ['required', 'decimal:0,2', 'max:9999999999999.99'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array{closing_cash: string, notes?: string|null}
     */
    public function shiftData(): array
    {
        $validated = $this->validated();
        $notes = $validated['notes'] ?? null;

        if ($notes !== null && ! is_string($notes)) {
            throw new \LogicException('Validated shift notes must be a string or null.');
        }

        return [
            'closing_cash' => $this->string('closing_cash')->toString(),
            'notes' => $notes,
        ];
    }
}
