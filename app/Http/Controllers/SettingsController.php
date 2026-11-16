<?php

namespace App\Http\Controllers;

use App\Http\Requests\SettingsRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Settings/Index', [
            'settings' => Setting::query()
                ->orderBy('setting_group')
                ->orderBy('setting_key')
                ->limit(100)
                ->get(['id', 'setting_group', 'setting_key', 'value']),
        ]);
    }

    public function update(SettingsRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            foreach ($request->validated('settings') as $setting) {
                Setting::query()->updateOrCreate(
                    [
                        'tenant_id' => $request->user()->tenant_id,
                        'setting_group' => $setting['setting_group'],
                        'setting_key' => $setting['setting_key'],
                    ],
                    ['value' => $setting['value']],
                );
            }
        });

        return redirect()->route('settings.index')->with('success', 'Pengaturan berhasil disimpan.');
    }
}
