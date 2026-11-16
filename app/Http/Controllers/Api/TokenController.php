<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class TokenController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['sometimes', 'required', 'string', 'max:100'],
        ]);

        $user = User::query()
            ->where('email', Str::lower($credentials['email']))
            ->first();

        if ($user === null || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Email atau kata sandi tidak valid.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $hasActiveTenant = $user->tenant_id !== null
            && Tenant::query()->whereKey($user->tenant_id)->where('is_active', true)->exists();

        if (! $user->is_active || ! $hasActiveTenant) {
            return response()->json([
                'message' => 'Akun tidak aktif atau tidak memiliki tenant aktif.',
            ], Response::HTTP_FORBIDDEN);
        }

        $expiresAt = now()->addHours(2);
        $token = $user->createToken(
            $credentials['device_name'] ?? 'Postman',
            ['suppliers:manage'],
            $expiresAt,
        );

        $user->forceFill(['last_login_at' => now()])->save();

        return response()->json([
            'data' => [
                'token' => $token->plainTextToken,
                'token_type' => 'Bearer',
                'expires_at' => $expiresAt->toISOString(),
                'user' => $user->only(['id', 'name', 'email']),
            ],
        ], Response::HTTP_CREATED);
    }

    public function destroy(Request $request): Response
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }
}
