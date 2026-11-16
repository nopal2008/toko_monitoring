<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Store;
use App\Models\User;
use App\Models\WorkSchedule;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    /**
     * @param  array{latitude?: numeric-string|float|null, longitude?: numeric-string|float|null, notes?: string|null}  $data
     */
    public function checkIn(User $user, array $data, ?string $photoPath = null): Attendance
    {
        return DB::transaction(function () use ($user, $data, $photoPath): Attendance {
            $employee = Employee::query()
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->firstOrFail();
            $store = Store::query()->findOrFail($employee->store_id);
            abort_unless($user->canAccessStore($store->id), 404);
            $date = now($this->timezone($user))->toDateString();

            if (Attendance::query()->where('employee_id', $employee->id)->whereDate('date', $date)->exists()) {
                throw ValidationException::withMessages([
                    'attendance' => 'Check-in untuk hari ini sudah tercatat.',
                ]);
            }

            $this->validateLocation($store, $data);
            $now = now($this->timezone($user));
            $schedule = WorkSchedule::query()
                ->where('employee_id', $employee->id)
                ->where('store_id', $store->id)
                ->where('day_of_week', $now->dayOfWeek)
                ->where('is_active', true)
                ->where(fn ($query) => $query->whereNull('effective_from')->orWhereDate('effective_from', '<=', $date))
                ->where(fn ($query) => $query->whereNull('effective_to')->orWhereDate('effective_to', '>=', $date))
                ->first();
            $scheduledStart = $schedule?->start_time;
            $lateMinutes = 0;

            if ($scheduledStart !== null) {
                $scheduledAt = Carbon::parse($date.' '.$scheduledStart, $this->timezone($user));
                $lateMinutes = max(0, (int) $scheduledAt->diffInMinutes($now, false));
            }

            return Attendance::query()->create([
                'tenant_id' => $user->tenant_id,
                'employee_id' => $employee->id,
                'store_id' => $store->id,
                'date' => $date,
                'scheduled_start' => $scheduledStart,
                'check_in_at' => $now,
                'late_minutes' => $lateMinutes,
                'status' => $lateMinutes > 0 ? 'late' : 'present',
                'check_in_latitude' => $data['latitude'] ?? null,
                'check_in_longitude' => $data['longitude'] ?? null,
                'photo_path' => $photoPath,
                'notes' => $data['notes'] ?? null,
            ]);
        });
    }

    /**
     * @param  array{latitude?: numeric-string|float|null, longitude?: numeric-string|float|null}  $data
     */
    public function checkOut(User $user, array $data, ?string $photoPath = null): Attendance
    {
        return DB::transaction(function () use ($user, $data, $photoPath): Attendance {
            $employee = Employee::query()->where('user_id', $user->id)->lockForUpdate()->firstOrFail();
            $date = now($this->timezone($user))->toDateString();
            $attendance = Attendance::query()
                ->where('employee_id', $employee->id)
                ->whereDate('date', $date)
                ->lockForUpdate()
                ->firstOrFail();

            if ($attendance->check_in_at === null || $attendance->check_out_at !== null) {
                throw ValidationException::withMessages([
                    'attendance' => 'Check-in belum dilakukan atau check-out sudah tercatat.',
                ]);
            }

            $store = Store::query()->findOrFail($employee->store_id);
            abort_unless($user->canAccessStore($store->id), 404);
            $this->validateLocation($store, $data, false);
            $checkOutAt = now($this->timezone($user));

            $attendance->forceFill([
                'check_out_at' => $checkOutAt,
                'work_minutes' => (int) $attendance->check_in_at->diffInMinutes($checkOutAt),
                'check_out_latitude' => $data['latitude'] ?? null,
                'check_out_longitude' => $data['longitude'] ?? null,
                'photo_path' => $photoPath ?? $attendance->photo_path,
            ])->save();

            return $attendance;
        });
    }

    /**
     * @param  array{latitude?: numeric-string|float|null, longitude?: numeric-string|float|null}  $data
     */
    private function validateLocation(Store $store, array $data, bool $requireLocation = true): void
    {
        if ($store->latitude === null || $store->longitude === null) {
            return;
        }

        if (! isset($data['latitude'], $data['longitude'])) {
            if ($requireLocation) {
                throw ValidationException::withMessages([
                    'latitude' => 'Lokasi diperlukan untuk check-in pada cabang ini.',
                ]);
            }

            return;
        }

        $earthRadius = 6371000;
        $latitudeDelta = deg2rad((float) $data['latitude'] - (float) $store->latitude);
        $longitudeDelta = deg2rad((float) $data['longitude'] - (float) $store->longitude);
        $latitudeOne = deg2rad((float) $store->latitude);
        $latitudeTwo = deg2rad((float) $data['latitude']);
        $haversine = sin($latitudeDelta / 2) ** 2
            + cos($latitudeOne) * cos($latitudeTwo) * sin($longitudeDelta / 2) ** 2;
        $distance = 2 * $earthRadius * asin(min(1, sqrt($haversine)));

        if ($distance > $store->radius_meter) {
            throw ValidationException::withMessages([
                'latitude' => 'Lokasi berada di luar area cabang.',
            ]);
        }
    }

    private function timezone(User $user): string
    {
        if ($user->tenant_id === null) {
            return config('app.timezone');
        }

        return $user->tenant->timezone;
    }
}
