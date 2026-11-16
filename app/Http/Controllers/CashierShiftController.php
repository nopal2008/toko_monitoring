<?php

namespace App\Http\Controllers;

use App\Http\Requests\CloseCashierShiftRequest;
use App\Http\Requests\OpenCashierShiftRequest;
use App\Models\CashierShift;
use App\Services\CashierShiftService;
use Illuminate\Http\RedirectResponse;

class CashierShiftController extends Controller
{
    public function open(OpenCashierShiftRequest $request, CashierShiftService $service): RedirectResponse
    {
        $shift = $service->open($request->user(), $request->shiftData());

        return redirect()->route('transactions.index', ['store_id' => $shift->store_id])
            ->with('success', 'Shift kasir berhasil dibuka.');
    }

    public function close(
        CloseCashierShiftRequest $request,
        CashierShift $shift,
        CashierShiftService $service,
    ): RedirectResponse {
        abort_unless($request->user()->canAccessStore($shift->store_id), 404);
        $service->close($shift, $request->user(), $request->shiftData());

        return redirect()->route('transactions.index', ['store_id' => $shift->store_id])
            ->with('success', 'Shift kasir berhasil ditutup.');
    }
}
