<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string|\Stringable|ValidationRule|InvokableRule>|string|\Stringable|ValidationRule|InvokableRule> */
    public function rules(): array
    {
        $area = $this->route('area');

        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('areas', 'name')->where('tenant_id', $this->user()->tenant_id)->ignore($area),
            ],
            'code' => [
                'required', 'string', 'max:50',
                Rule::unique('areas', 'code')->where('tenant_id', $this->user()->tenant_id)->ignore($area),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
