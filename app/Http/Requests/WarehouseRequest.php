<?php

namespace App\Http\Requests;

use App\Models\Warehouse;
use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string|\Stringable|ValidationRule|InvokableRule>|string|\Stringable|ValidationRule|InvokableRule> */
    public function rules(): array
    {
        $warehouse = $this->route('warehouse');

        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required', 'string', 'max:50',
                Rule::unique('warehouses', 'code')->where('tenant_id', $this->user()->tenant_id)->ignore($warehouse instanceof Warehouse ? $warehouse->getKey() : $warehouse),
            ],
            'type' => ['required', 'string', 'in:central,branch'],
            'store_id' => [
                'required_if:type,branch', 'nullable', 'integer',
                Rule::exists('stores', 'id')->where('tenant_id', $this->user()->tenant_id),
            ],
            'address' => ['nullable', 'string', 'max:5000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
