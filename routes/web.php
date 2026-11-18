<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CashierShiftController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ImpersonationController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StockTransferController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:login')
    ->name('login.store');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');
Route::post('/impersonation/stop', [ImpersonationController::class, 'stop'])
    ->middleware('auth')
    ->name('impersonation.stop');

Route::middleware(['auth', 'tenant'])->group(function (): void {
    Route::get('/dashboard', DashboardController::class)
        ->middleware(['role:owner|admin|area_manager|store_manager|cashier|staff', 'store.access'])
        ->name('dashboard');

    Route::middleware('role:owner|admin')->group(function (): void {
        Route::middleware('permission:user.manage')->prefix('accounts')->name('accounts.')->group(function (): void {
            Route::get('/', [AccountController::class, 'index'])->name('index');
            Route::get('/create', [AccountController::class, 'create'])->name('create');
            Route::post('/', [AccountController::class, 'store'])->middleware('throttle:write')->name('store');
            Route::get('/{account}/edit', [AccountController::class, 'edit'])->name('edit');
            Route::match(['put', 'patch'], '/{account}', [AccountController::class, 'update'])
                ->middleware('throttle:write')->name('update');
            Route::delete('/{account}', [AccountController::class, 'destroy'])
                ->middleware('throttle:write')->name('destroy');
            Route::post('/{account}/impersonate', [ImpersonationController::class, 'start'])
                ->middleware('throttle:write')->name('impersonate');
        });

        Route::get('/stores', [StoreController::class, 'index'])->name('stores.index');
        Route::get('/stores/create', [StoreController::class, 'create'])->name('stores.create');
        Route::post('/stores', [StoreController::class, 'store'])->middleware('throttle:write')->name('stores.store');
        Route::get('/stores/{store}', [StoreController::class, 'show'])->name('stores.show');
        Route::get('/stores/{store}/edit', [StoreController::class, 'edit'])->name('stores.edit');
        Route::match(['put', 'patch'], '/stores/{store}', [StoreController::class, 'update'])
            ->middleware('throttle:write')->name('stores.update');
        Route::delete('/stores/{store}', [StoreController::class, 'destroy'])
            ->middleware('throttle:write')->name('stores.destroy');
    });

    Route::middleware('permission:product.view')->group(function (): void {
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
    });
    Route::middleware('permission:product.manage')->group(function (): void {
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
        Route::post('/products', [ProductController::class, 'store'])->middleware('throttle:write')->name('products.store');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit');
        Route::match(['put', 'patch'], '/products/{product}', [ProductController::class, 'update'])
            ->middleware('throttle:write')->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])
            ->middleware('throttle:write')->name('products.destroy');
        Route::post('/products/{id}/restore', [ProductController::class, 'restore'])
            ->middleware('throttle:write')->name('products.restore');
    });

    Route::middleware('permission:product.view')->group(function (): void {
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/{category}', [CategoryController::class, 'show'])->name('categories.show');
    });
    Route::middleware('permission:product.manage')->group(function (): void {
        Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
        Route::post('/categories', [CategoryController::class, 'store'])->middleware('throttle:write')->name('categories.store');
        Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
        Route::match(['put', 'patch'], '/categories/{category}', [CategoryController::class, 'update'])
            ->middleware('throttle:write')->name('categories.update');
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
            ->middleware('throttle:write')->name('categories.destroy');
    });

    Route::middleware(['role:owner|admin', 'permission:product.manage'])->group(function (): void {
        Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::get('/suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create');
        Route::post('/suppliers', [SupplierController::class, 'store'])->middleware('throttle:write')->name('suppliers.store');
        Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])->name('suppliers.show');
        Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])->name('suppliers.edit');
        Route::match(['put', 'patch'], '/suppliers/{supplier}', [SupplierController::class, 'update'])
            ->middleware('throttle:write')->name('suppliers.update');
        Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])
            ->middleware('throttle:write')->name('suppliers.destroy');
    });

    Route::middleware('permission:area.view')->group(function (): void {
        Route::get('/areas', [AreaController::class, 'index'])->name('areas.index');
        Route::get('/areas/{area}', [AreaController::class, 'show'])->name('areas.show');
    });

    Route::middleware('permission:area.manage')->group(function (): void {
        Route::get('/areas/create', [AreaController::class, 'create'])->name('areas.create');
        Route::post('/areas', [AreaController::class, 'store'])->middleware('throttle:write')->name('areas.store');
        Route::get('/areas/{area}/edit', [AreaController::class, 'edit'])->name('areas.edit');
        Route::match(['put', 'patch'], '/areas/{area}', [AreaController::class, 'update'])
            ->middleware('throttle:write')->name('areas.update');
        Route::delete('/areas/{area}', [AreaController::class, 'destroy'])
            ->middleware('throttle:write')->name('areas.destroy');
        Route::post('/areas/{id}/restore', [AreaController::class, 'restore'])
            ->middleware('throttle:write')->name('areas.restore');
    });

    Route::middleware('permission:warehouse.view')->group(function (): void {
        Route::get('/warehouses', [WarehouseController::class, 'index'])->name('warehouses.index');
        Route::get('/warehouses/{warehouse}', [WarehouseController::class, 'show'])->name('warehouses.show');
    });

    Route::middleware('permission:warehouse.manage')->group(function (): void {
        Route::get('/warehouses/create', [WarehouseController::class, 'create'])->name('warehouses.create');
        Route::post('/warehouses', [WarehouseController::class, 'store'])->middleware('throttle:write')->name('warehouses.store');
        Route::get('/warehouses/{warehouse}/edit', [WarehouseController::class, 'edit'])->name('warehouses.edit');
        Route::match(['put', 'patch'], '/warehouses/{warehouse}', [WarehouseController::class, 'update'])
            ->middleware('throttle:write')->name('warehouses.update');
        Route::delete('/warehouses/{warehouse}', [WarehouseController::class, 'destroy'])
            ->middleware('throttle:write')->name('warehouses.destroy');
        Route::post('/warehouses/{id}/restore', [WarehouseController::class, 'restore'])
            ->middleware('throttle:write')->name('warehouses.restore');
    });

    Route::middleware('permission:brand.view')->group(function (): void {
        Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
        Route::get('/brands/{brand}', [BrandController::class, 'show'])->name('brands.show');
    });

    Route::middleware('permission:brand.manage')->group(function (): void {
        Route::get('/brands/create', [BrandController::class, 'create'])->name('brands.create');
        Route::post('/brands', [BrandController::class, 'store'])->middleware('throttle:write')->name('brands.store');
        Route::get('/brands/{brand}/edit', [BrandController::class, 'edit'])->name('brands.edit');
        Route::match(['put', 'patch'], '/brands/{brand}', [BrandController::class, 'update'])
            ->middleware('throttle:write')->name('brands.update');
        Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])
            ->middleware('throttle:write')->name('brands.destroy');
        Route::post('/brands/{id}/restore', [BrandController::class, 'restore'])
            ->middleware('throttle:write')->name('brands.restore');
    });

    Route::middleware('permission:unit.view')->group(function (): void {
        Route::get('/units', [UnitController::class, 'index'])->name('units.index');
        Route::get('/units/{unit}', [UnitController::class, 'show'])->name('units.show');
    });

    Route::middleware('permission:unit.manage')->group(function (): void {
        Route::get('/units/create', [UnitController::class, 'create'])->name('units.create');
        Route::post('/units', [UnitController::class, 'store'])->middleware('throttle:write')->name('units.store');
        Route::get('/units/{unit}/edit', [UnitController::class, 'edit'])->name('units.edit');
        Route::match(['put', 'patch'], '/units/{unit}', [UnitController::class, 'update'])
            ->middleware('throttle:write')->name('units.update');
        Route::delete('/units/{unit}', [UnitController::class, 'destroy'])
            ->middleware('throttle:write')->name('units.destroy');
        Route::post('/units/{id}/restore', [UnitController::class, 'restore'])
            ->middleware('throttle:write')->name('units.restore');
    });

    Route::middleware('permission:attendance.view')->group(function (): void {
        Route::get('/employees', [EmployeeController::class, 'index'])
            ->middleware('store.access')->name('employees.index');
    });
    Route::middleware('permission:attendance.manage')->group(function (): void {
        Route::get('/employees/create', [EmployeeController::class, 'create'])->name('employees.create');
        Route::post('/employees', [EmployeeController::class, 'store'])
            ->middleware(['store.access', 'throttle:write'])->name('employees.store');
        Route::get('/employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');
        Route::get('/employees/{employee}/edit', [EmployeeController::class, 'edit'])->name('employees.edit');
        Route::match(['put', 'patch'], '/employees/{employee}', [EmployeeController::class, 'update'])
            ->middleware('throttle:write')->name('employees.update');
        Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])
            ->middleware('throttle:write')->name('employees.destroy');
    });

    Route::get('/inventories', [InventoryController::class, 'index'])
        ->middleware(['permission:inventory.view', 'store.access'])
        ->name('inventories.index');
    Route::post('/inventories/adjust', [InventoryController::class, 'adjust'])
        ->middleware(['permission:inventory.adjust', 'store.access', 'throttle:write'])
        ->name('inventories.adjust');
    Route::post('/inventories/transfer', [StockTransferController::class, 'store'])
        ->middleware(['permission:inventory.transfer', 'store.access', 'throttle:write'])
        ->name('inventories.transfer.store');
    Route::post('/inventories/transfer/{transfer}/approve', [StockTransferController::class, 'approve'])
        ->middleware(['role:owner|admin|area_manager', 'permission:inventory.transfer', 'throttle:write'])
        ->name('inventories.transfer.approve');
    Route::post('/inventories/transfer/{transfer}/ship', [StockTransferController::class, 'ship'])
        ->middleware(['permission:inventory.transfer', 'throttle:write'])
        ->name('inventories.transfer.ship');
    Route::post('/inventories/transfer/{transfer}/complete', [StockTransferController::class, 'complete'])
        ->middleware(['permission:inventory.transfer', 'throttle:write'])
        ->name('inventories.transfer.complete');
    Route::post('/inventories/transfer/{transfer}/cancel', [StockTransferController::class, 'cancel'])
        ->middleware(['permission:inventory.transfer', 'throttle:write'])
        ->name('inventories.transfer.cancel');

    Route::post('/cashier-shifts/open', [CashierShiftController::class, 'open'])
        ->middleware(['permission:transaction.create', 'store.access', 'throttle:write'])
        ->name('cashier-shifts.open');
    Route::post('/cashier-shifts/{shift}/close', [CashierShiftController::class, 'close'])
        ->middleware(['permission:transaction.create', 'throttle:write'])
        ->name('cashier-shifts.close');

    Route::get('/pos', [PosController::class, 'index'])
        ->middleware(['permission:transaction.create', 'store.access'])
        ->name('pos.index');

    Route::get('/transactions', [TransactionController::class, 'index'])
        ->middleware(['permission:transaction.view', 'store.access'])
        ->name('transactions.index');
    Route::post('/transactions', [TransactionController::class, 'store'])
        ->middleware(['permission:transaction.create', 'store.access', 'throttle:write'])
        ->name('transactions.store');
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show'])
        ->middleware('permission:transaction.view')
        ->name('transactions.show');
    Route::post('/transactions/{transaction}/cancel', [TransactionController::class, 'cancel'])
        ->middleware(['permission:transaction.cancel', 'throttle:write'])
        ->name('transactions.cancel');

    Route::get('/attendances', [AttendanceController::class, 'index'])
        ->middleware(['permission:attendance.view', 'store.access'])
        ->name('attendances.index');
    Route::post('/attendances/check-in', [AttendanceController::class, 'checkIn'])
        ->middleware('throttle:write')
        ->name('attendances.check-in');
    Route::post('/attendances/check-out', [AttendanceController::class, 'checkOut'])
        ->middleware('throttle:write')
        ->name('attendances.check-out');

    Route::get('/expenses', [ExpenseController::class, 'index'])
        ->middleware(['permission:expense.create', 'store.access'])
        ->name('expenses.index');
    Route::post('/expenses', [ExpenseController::class, 'store'])
        ->middleware(['permission:expense.create', 'store.access', 'throttle:write'])
        ->name('expenses.store');
    Route::post('/expenses/{expense}/approve', [ExpenseController::class, 'approve'])
        ->middleware(['permission:expense.approve', 'throttle:write'])
        ->name('expenses.approve');

    Route::get('/reports/sales', [ReportController::class, 'sales'])
        ->middleware(['permission:report.view', 'store.access'])
        ->name('reports.sales');
    Route::get('/reports/inventory', [ReportController::class, 'inventory'])
        ->middleware(['permission:report.view', 'store.access'])
        ->name('reports.inventory');
    Route::get('/reports/attendance', [ReportController::class, 'attendance'])
        ->middleware(['permission:report.view', 'store.access'])
        ->name('reports.attendance');
    Route::get('/reports/expenses', [ReportController::class, 'expenses'])
        ->middleware(['permission:report.view', 'store.access'])
        ->name('reports.expenses');
    Route::get('/reports/{type}/export', [ReportController::class, 'export'])
        ->middleware(['permission:report.export', 'store.access'])
        ->name('reports.export');

    Route::get('/settings', [SettingsController::class, 'index'])
        ->middleware(['role:owner|admin', 'permission:setting.manage'])
        ->name('settings.index');
    Route::put('/settings', [SettingsController::class, 'update'])
        ->middleware(['role:owner|admin', 'permission:setting.manage', 'throttle:write'])
        ->name('settings.update');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/poll', [NotificationController::class, 'poll'])
        ->middleware('throttle:notifications-poll')
        ->name('notifications.poll');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'read'])
        ->middleware('throttle:write')
        ->name('notifications.read');
});
