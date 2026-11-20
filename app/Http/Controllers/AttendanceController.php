<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckInAttendanceRequest;
use App\Http\Requests\CheckOutAttendanceRequest;
use App\Models\Attendance;
use App\Services\AttendanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Attendance::class);
        $user = $request->user();
        $storeId = $request->integer('store_id');
        $attendanceQuery = Attendance::query()
            ->with(['employee:id,name,employee_code', 'store:id,name'])
            ->when($request->filled('date'), fn ($query) => $query->whereDate('date', $request->input('date')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->latest('date');

        if ($storeId > 0) {
            $attendanceQuery->where('store_id', $storeId);
        } elseif (! $user->hasAnyRole(['owner'])) {
            $attendanceQuery->whereIn('store_id', $user->stores()->select('stores.id'));
        }

        $attendances = $attendanceQuery
            ->paginate(min(max($request->integer('per_page', 10), 1), 100))
            ->withQueryString();

        return Inertia::render('Attendances/Index', ['attendances' => $attendances]);
    }

    public function checkIn(CheckInAttendanceRequest $request, AttendanceService $service): RedirectResponse
    {
        $attendance = $service->checkIn($request->user(), $request->validated());
        $photo = $request->file('photo');

        if ($photo !== null) {
            $attendance->forceFill(['photo_path' => $photo->storePublicly('attendance', 'public')])->save();
        }

        return back()->with('success', 'Check-in berhasil dicatat.');
    }

    public function checkOut(CheckOutAttendanceRequest $request, AttendanceService $service): RedirectResponse
    {
        $attendance = $service->checkOut($request->user(), $request->validated());
        $photo = $request->file('photo');

        if ($photo !== null) {
            $attendance->forceFill(['photo_path' => $photo->storePublicly('attendance', 'public')])->save();
        }

        return back()->with('success', 'Check-out berhasil dicatat.');
    }
}
