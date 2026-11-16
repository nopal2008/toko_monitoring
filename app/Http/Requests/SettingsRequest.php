<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string|\Stringable|ValidationRule|InvokableRule>|string|\Stringable|ValidationRule|InvokableRule> */
    public function rules(): array
    {
        return [
            'settings' => ['required', 'array', 'max:100'],
            'settings.*.setting_group' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9_-]+$/'],
            'settings.*.setting_key' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_.-]+$/'],
            'settings.*.value' => ['present', 'nullable'],
        ];
    }
}
