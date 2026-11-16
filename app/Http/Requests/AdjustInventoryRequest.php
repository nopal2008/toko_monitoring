<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AdjustInventoryRequest extends FormRequest
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
            'product_id' => ['required', 'integer', 'min:1'],
            'quantity_change' => ['required', 'integer', 'not_in:0', 'between:-1000000,1000000'],
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array{store_id: int, product_id: int, quantity_change: int, reason: string}
     */
    public function adjustmentData(): array
    {
        return [
            'store_id' => $this->integer('store_id'),
            'product_id' => $this->integer('product_id'),
            'quantity_change' => $this->integer('quantity_change'),
            'reason' => $this->string('reason')->toString(),
        ];
    }
}
