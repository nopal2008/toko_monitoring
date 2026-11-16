<?php

namespace App\Http\Requests;

use App\Models\Employee;
use Illuminate\Contracts\Validation\InvokableRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string|\Stringable|ValidationRule|InvokableRule>|string|\Stringable|ValidationRule|InvokableRule> */
    public function rules(): array
    {
        $employee = $this->route('employee');
        $tenantId = $this->user()->tenant_id;

        return [
            'user_id' => [
                'nullable', 'integer',
                Rule::exists('users', 'id')->where('tenant_id', $tenantId),
            ],
            'store_id' => [
                'required', 'integer',
                Rule::exists('stores', 'id')->where('tenant_id', $tenantId),
            ],
            'employee_code' => [
                'required', 'string', 'max:50',
                Rule::unique('employees', 'employee_code')->where('tenant_id', $tenantId)->ignore($employee instanceof Employee ? $employee->getKey() : $employee),
            ],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'position' => ['nullable', 'string', 'max:100'],
            'join_date' => ['nullable', 'date'],
            'resign_date' => ['nullable', 'date', 'after_or_equal:join_date'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
