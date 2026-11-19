<?php

namespace App\Http\Requests;

use App\Models\Promotion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PromotionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $tenantId = $this->user()->tenant_id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'store_id' => ['nullable', 'integer', Rule::exists('stores', 'id')->where('tenant_id', $tenantId)],
            'product_id' => ['nullable', 'integer', Rule::exists('products', 'id')->where('tenant_id', $tenantId)],
            'type' => ['required', Rule::in([Promotion::TYPE_PERCENT, Promotion::TYPE_FIXED, Promotion::TYPE_BOGO])],
            'value' => ['required', 'decimal:0,2', 'min:0', 'max:9999999999999.99'],
            'buy_quantity' => ['nullable', 'integer', 'min:1', 'max:100000', 'required_if:type,bogo'],
            'free_quantity' => ['nullable', 'integer', 'min:1', 'max:100000', 'required_if:type,bogo'],
            'min_purchase' => ['nullable', 'decimal:0,2', 'min:0', 'max:9999999999999.99'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
