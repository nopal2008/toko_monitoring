<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ExpenseService
{
    /**
     * @param array{store_id: int, expense_category_id: int, title: string, amount: string|int, expense_date: string, payment_method: string, notes?: string|null} $data
     */
    public function create(User $user, array $data, ?string $attachmentPath = null): Expense
    {
        Store::query()->findOrFail($data['store_id']);
        ExpenseCategory::query()->findOrFail($data['expense_category_id']);

        return Expense::query()->create([
            'tenant_id' => $user->tenant_id,
            'store_id' => $data['store_id'],
            'expense_category_id' => $data['expense_category_id'],
            'title' => $data['title'],
            'amount' => $data['amount'],
            'expense_date' => $data['expense_date'],
            'payment_method' => $data['payment_method'],
            'status' => 'draft',
            'notes' => $data['notes'] ?? null,
            'attachment_path' => $attachmentPath,
            'created_by' => $user->id,
        ]);
    }

    public function decide(Expense $expense, User $approver, string $decision): Expense
    {
        return DB::transaction(function () use ($expense, $approver, $decision): Expense {
            $expense = Expense::query()->lockForUpdate()->findOrFail($expense->id);

            if ($expense->status !== 'draft') {
                throw ValidationException::withMessages([
                    'expense' => 'Hanya pengeluaran draft yang dapat disetujui atau ditolak.',
                ]);
            }

            $expense->forceFill([
                'status' => $decision,
                'approved_by' => $approver->id,
                'approved_at' => now(),
            ])->save();

            return $expense;
        });
    }
}
