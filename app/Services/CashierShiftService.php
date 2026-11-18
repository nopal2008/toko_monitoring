<?php

namespace App\Services;

use App\Models\CashierShift;
use App\Models\Store;
use App\Models\Transaction;
use App\Models\User;
use App\Support\MoneyAmount;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CashierShiftService
{
    /**
     * @param  array{store_id: int, opening_cash: string|int, notes?: string|null}  $data
     */
    public function open(User $user, array $data): CashierShift
    {
        return DB::transaction(function () use ($user, $data): CashierShift {
            $store = Store::query()->lockForUpdate()->findOrFail($data['store_id']);
            $openShiftExists = CashierShift::query()
                ->where('store_id', $store->id)
                ->where('user_id', $user->id)
                ->where('status', 'open')
                ->exists();

            if ($openShiftExists) {
                throw ValidationException::withMessages([
                    'store_id' => 'Anda sudah memiliki shift kasir terbuka di cabang ini.',
                ]);
            }

            return CashierShift::query()->create([
                'tenant_id' => $user->tenant_id,
                'store_id' => $store->id,
                'user_id' => $user->id,
                'opened_at' => now(),
                'opening_cash' => MoneyAmount::fromMinorUnits(MoneyAmount::toMinorUnits($data['opening_cash'])),
                'status' => 'open',
                'notes' => $data['notes'] ?? null,
            ]);
        });
    }

    /**
     * @param  array{closing_cash: string|int, notes?: string|null}  $data
     */
    public function close(CashierShift $shift, User $user, array $data): CashierShift
    {
        return DB::transaction(function () use ($shift, $user, $data): CashierShift {
            $lockedShift = CashierShift::query()->lockForUpdate()->findOrFail($shift->id);

            if ($lockedShift->status !== 'open' || $lockedShift->user_id !== $user->id) {
                throw ValidationException::withMessages([
                    'shift' => 'Shift tidak terbuka atau bukan milik Anda.',
                ]);
            }

            $cashSales = Transaction::query()
                ->where('cashier_shift_id', $lockedShift->id)
                ->where('status', 'completed')
                ->where('payment_method', 'cash')
                ->sum('total_amount');
            $expectedCash = MoneyAmount::toMinorUnits((string) $lockedShift->opening_cash)
                + MoneyAmount::toMinorUnits((string) $cashSales);
            $closingCash = MoneyAmount::toMinorUnits($data['closing_cash']);

            $lockedShift->forceFill([
                'closed_at' => now(),
                'closing_cash' => MoneyAmount::fromMinorUnits($closingCash),
                'expected_cash' => MoneyAmount::fromMinorUnits($expectedCash),
                'cash_difference' => MoneyAmount::fromMinorUnits($closingCash - $expectedCash),
                'status' => 'closed',
                'notes' => $data['notes'] ?? $lockedShift->notes,
            ])->save();

            return $lockedShift;
        });
    }
}
