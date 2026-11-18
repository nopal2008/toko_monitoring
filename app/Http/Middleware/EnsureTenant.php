<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenant
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Middleware 'auth' already ensures user is not null,
        // so we only check tenant_id and active status
        abort_unless($user->tenant_id !== null && $user->is_active, 403);
        abort_unless(Tenant::query()->whereKey($user->tenant_id)->where('is_active', true)->exists(), 403);

        return $next($request);
    }
}
