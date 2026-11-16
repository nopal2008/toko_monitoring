<?php

namespace App\Providers;

use App\Models\Attendance;
use App\Models\Category;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\StockTransfer;
use App\Models\Store;
use App\Models\Supplier;
use App\Models\Transaction;
use App\Policies\TenantResourcePolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureRateLimits();
        $this->registerTenantPolicies();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);
        Model::preventLazyLoading(! app()->isProduction());

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function configureRateLimits(): void
    {
        RateLimiter::for('login', function (Request $request): Limit {
            $key = Str::transliterate(Str::lower($request->string('email')->toString()).'|'.$request->ip());

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('write', function (Request $request): Limit {
            return Limit::perMinute(60)->by((string) $request->user()?->getAuthIdentifier());
        });

        RateLimiter::for('notifications-poll', function (Request $request): Limit {
            return Limit::perMinute(120)->by((string) $request->user()?->getAuthIdentifier());
        });
    }

    protected function registerTenantPolicies(): void
    {
        foreach ([
            Attendance::class,
            Category::class,
            Employee::class,
            Expense::class,
            Inventory::class,
            Product::class,
            StockTransfer::class,
            Store::class,
            Supplier::class,
            Transaction::class,
        ] as $model) {
            Gate::policy($model, TenantResourcePolicy::class);
        }
    }
}
