<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureStoreAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Middleware 'auth' already ensures user is not null
        $storeIds = collect([
            $request->route('store'),
            $request->input('store_id'),
            $request->input('store'),
            $request->input('from_store_id'),
            $request->input('to_store_id'),
        ])->filter()->map(function (mixed $value): int {
            return $value instanceof Model ? (int) $value->getKey() : (int) $value;
        })->unique();

        // Only check store access if store IDs are present
        // Owner/admin can access all pages without specific store
        if ($storeIds->isNotEmpty()) {
            foreach ($storeIds as $storeId) {
                abort_unless($user->canAccessStore($storeId), 403);
            }
        }

        return $next($request);
    }
}
