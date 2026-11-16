<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
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

        abort_unless($user !== null, 403);

        $storeIds = collect([
            $request->route('store'),
            $request->input('store_id'),
            $request->input('store'),
            $request->input('from_store_id'),
            $request->input('to_store_id'),
        ])->filter()->map(function (mixed $value): int {
            return $value instanceof Model ? (int) $value->getKey() : (int) $value;
        })->unique();

        foreach ($storeIds as $storeId) {
            abort_unless($user->canAccessStore($storeId), 403);
        }

        return $next($request);
    }
}
