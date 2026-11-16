<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => $request->user()->notifications()
                ->latest()
                ->paginate(min(max($request->integer('per_page', 10), 1), 100)),
        ]);
    }

    public function poll(Request $request): JsonResponse
    {
        $user = $request->user();
        $cacheKey = "notifications:poll:user:{$user->id}";
        $cached = Cache::has($cacheKey);

        $data = Cache::remember($cacheKey, 15, function () use ($user): array {
            return [
                'unread_count' => $user->unreadNotifications()->count(),
                'notifications' => $user->notifications()
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'type', 'data', 'read_at', 'created_at'])
                    ->map(static function (DatabaseNotification $notification): array {
                        $payload = $notification->getAttribute('data');
                        $payload = is_array($payload) ? $payload : [];
                        $type = $payload['type'] ?? $notification->getAttribute('type');
                        $message = $payload['message'] ?? '';
                        $readAt = $notification->getAttribute('read_at');
                        $createdAt = $notification->getAttribute('created_at');

                        if (! is_string($type) || ! is_string($message)) {
                            throw new \UnexpectedValueException('Notification payload has an invalid type or message.');
                        }

                        if (($readAt !== null && ! $readAt instanceof Carbon)
                            || ! $createdAt instanceof Carbon) {
                            throw new \UnexpectedValueException('Notification timestamps have an invalid type.');
                        }

                        return [
                            'id' => $notification->getKey(),
                            'type' => $type,
                            'message' => $message,
                            'read_at' => $readAt?->toISOString(),
                            'created_at' => $createdAt->toISOString(),
                        ];
                    })
                    ->all(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => ['cached' => $cached, 'ttl' => 15],
        ]);
    }

    public function read(Request $request, string $notification): RedirectResponse
    {
        $item = $request->user()->notifications()->whereKey($notification)->firstOrFail();
        $item->markAsRead();
        Cache::forget("notifications:poll:user:{$request->user()->id}");

        return back()->with('success', 'Notifikasi ditandai sudah dibaca.');
    }
}
