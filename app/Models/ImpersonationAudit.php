<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImpersonationAudit extends Model
{
    protected $fillable = [
        'tenant_id',
        'actor_user_id',
        'target_user_id',
        'actor_name',
        'target_name',
        'target_role',
        'ip_address',
        'user_agent',
        'started_at',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
        ];
    }
}
