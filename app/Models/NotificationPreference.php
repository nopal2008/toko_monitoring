<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'user_id', 'event_key', 'in_app', 'email', 'whatsapp'];

    protected function casts(): array
    {
        return ['in_app' => 'boolean', 'email' => 'boolean', 'whatsapp' => 'boolean'];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
