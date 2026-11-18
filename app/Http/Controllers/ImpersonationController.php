<?php

namespace App\Http\Controllers;

use App\Models\ImpersonationAudit;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    public function start(Request $request, User $account): RedirectResponse
    {
        $actor = $request->user();
        abort_if($request->session()->has('impersonator_id'), 403, 'Sesi impersonasi sudah aktif.');
        abort_unless(
            $account->tenant_id === $actor->tenant_id && $account->is_active,
            404,
        );
        abort_if($account->is($actor), 422, 'Tidak dapat login sebagai akun sendiri.');

        $audit = ImpersonationAudit::query()->create([
            'tenant_id' => $actor->tenant_id,
            'actor_user_id' => $actor->id,
            'target_user_id' => $account->id,
            'actor_name' => $actor->name,
            'target_name' => $account->name,
            'target_role' => $account->getRoleNames()->implode(', '),
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 1000),
            'started_at' => now(),
        ]);

        $request->session()->put([
            'impersonator_id' => $actor->id,
            'impersonation_audit_id' => $audit->id,
        ]);
        Auth::login($account);
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', "Anda sekarang masuk sebagai {$account->name}.");
    }

    public function stop(Request $request): RedirectResponse
    {
        $actorId = $request->session()->get('impersonator_id');
        abort_unless(is_int($actorId) || ctype_digit((string) $actorId), 403);

        $targetId = $request->user()?->id;
        $auditId = $request->session()->get('impersonation_audit_id');

        if (is_int($auditId) || ctype_digit((string) $auditId)) {
            ImpersonationAudit::query()
                ->whereKey((int) $auditId)
                ->where('actor_user_id', (int) $actorId)
                ->where('target_user_id', $targetId)
                ->whereNull('ended_at')
                ->update(['ended_at' => now()]);
        }

        $actor = User::query()->find((int) $actorId);
        $request->session()->forget(['impersonator_id', 'impersonation_audit_id']);

        if ($actor === null || ! $actor->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('error', 'Akun owner tidak lagi aktif. Silakan hubungi administrator.');
        }

        Auth::login($actor);
        $request->session()->regenerate();

        return redirect()->route('accounts.index')->with('success', 'Anda kembali ke akun owner.');
    }
}
