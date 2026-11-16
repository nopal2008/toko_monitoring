<?php

use App\Http\Controllers\Api\SupplierApiController;
use App\Http\Controllers\Api\TokenController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::post('/login', [TokenController::class, 'store'])
        ->middleware('throttle:login')
        ->name('login');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/user', fn (Request $request): array => [
            'data' => $request->user()->only(['id', 'name', 'email']),
        ])->name('user');

        Route::post('/logout', [TokenController::class, 'destroy'])
            ->middleware('throttle:write')
            ->name('logout');

        Route::middleware([
            'tenant',
            'role:owner|admin',
            'permission:product.manage',
            'abilities:suppliers:manage',
        ])->group(function (): void {
            Route::get('/suppliers', [SupplierApiController::class, 'index'])->name('suppliers.index');
            Route::get('/suppliers/{supplier}', [SupplierApiController::class, 'show'])->name('suppliers.show');

            Route::middleware('throttle:write')->group(function (): void {
                Route::post('/suppliers', [SupplierApiController::class, 'store'])->name('suppliers.store');
                Route::match(['put', 'patch'], '/suppliers/{supplier}', [SupplierApiController::class, 'update'])
                    ->name('suppliers.update');
                Route::delete('/suppliers/{supplier}', [SupplierApiController::class, 'destroy'])
                    ->name('suppliers.destroy');
            });
        });
    });
});
