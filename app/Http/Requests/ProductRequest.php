<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string|\Stringable|ValidationRule|InvokableRule>|string|\Stringable|ValidationRule|InvokableRule> */
    public function rules(): array
    {
        $product = $this->route('product');
        $tenantId = $this->user()->tenant_id;

        return [
            'category_id' => [
                'nullable', 'integer',
                Rule::exists('categories', 'id')->where('tenant_id', $tenantId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'sku' => [
                'required', 'string', 'max:100',
                Rule::unique('products', 'sku')->where('tenant_id', $tenantId)->ignore($product instanceof Product ? $product->getKey() : $product),
            ],
            'barcode' => ['nullable', 'string', 'max:100'],
            'unit' => ['required', 'string', 'max:20'],
            'description' => ['nullable', 'string', 'max:5000'],
            'base_price' => ['required', 'decimal:0,2', 'max:9999999999999.99'],
            'cost_price' => ['required', 'decimal:0,2', 'max:9999999999999.99'],
            'is_active' => ['sometimes', 'boolean'],
            'stores' => ['sometimes', 'array', 'max:100'],
            'stores.*.store_id' => [
                'required', 'integer', 'distinct',
                Rule::exists('stores', 'id')->where('tenant_id', $tenantId),
            ],
            'stores.*.price' => ['nullable', 'decimal:0,2', 'max:9999999999999.99'],
            'stores.*.min_stock' => ['nullable', 'integer', 'min:0'],
            'stores.*.is_available' => ['sometimes', 'boolean'],
        ];
    }
}
