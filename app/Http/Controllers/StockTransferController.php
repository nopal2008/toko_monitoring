<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateStockTransferRequest;
use App\Http\Requests\ReceiveStockTransferRequest;
use App\Models\StockTransfer;
use App\Services\StockTransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StockTransferController extends Controller
{
    public function store(CreateStockTransferRequest $request, StockTransferService $service): RedirectResponse
    {
        $this->authorize('create', StockTransfer::class);
        $transfer = $service->create($request->user(), $request->transferData());

        return redirect()->route('inventories.index', ['store_id' => $transfer->from_store_id])
            ->with('success', 'Permintaan transfer stok berhasil dibuat.');
    }

    public function approve(Request $request, StockTransfer $transfer, StockTransferService $service): RedirectResponse
    {
        $this->authorize('update', $transfer);
        $service->approve($transfer, $request->user());

        return back()->with('success', 'Transfer stok berhasil disetujui.');
    }

    public function ship(Request $request, StockTransfer $transfer, StockTransferService $service): RedirectResponse
    {
        $this->authorize('update', $transfer);
        $service->ship($transfer, $request->user());

        return back()->with('success', 'Stok telah dikirim dan dikurangi dari cabang asal.');
    }

    public function complete(
        ReceiveStockTransferRequest $request,
        StockTransfer $transfer,
        StockTransferService $service,
    ): RedirectResponse {
        $this->authorize('update', $transfer);
        $service->complete($transfer, $request->validated('items'), $request->user());

        return back()->with('success', 'Transfer stok berhasil diselesaikan.');
    }

    public function cancel(Request $request, StockTransfer $transfer, StockTransferService $service): RedirectResponse
    {
        $this->authorize('update', $transfer);
        $service->cancel($transfer, $request->user());

        return back()->with('success', 'Transfer stok berhasil dibatalkan.');
    }
}
