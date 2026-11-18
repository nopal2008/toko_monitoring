<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class SpaSessionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);
        $credentials['email'] = Str::lower($credentials['email']);

        if (! Auth::guard('web')->attempt($credentials)) {
            return response()->json([
                'message' => 'Email atau kata sandi tidak valid.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $user = $request->user();

        if (! ($user instanceof User)) {
            Auth::guard('web')->logout();

            return response()->json([
                'message' => 'Email atau kata sandi tidak valid.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $hasActiveTenant = $user->tenant_id !== null
            && Tenant::query()->whereKey($user->tenant_id)->where('is_active', true)->exists();

        if (! $user->is_active || ! $hasActiveTenant) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Akun tidak aktif atau tidak memiliki tenant aktif.',
            ], Response::HTTP_FORBIDDEN);
        }

        $request->session()->regenerate();

        return response()->json([
            'data' => $user->only(['id', 'name', 'email']),
        ]);
    }

    public function destroy(Request $request): Response
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Auth::forgetGuards();

        return response()->noContent();
    }
}
