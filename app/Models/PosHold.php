<?php

namespace App\Models;

use App\Models\Concerns\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $store_id
 * @property int $user_id
 * @property string $label
 * @property array<int, array{product_id: int, quantity: int, price: string}> $payload
 */
class PosHold extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'store_id', 'user_id', 'label', 'payload'];

    protected function casts(): array
    {
        return ['payload' => 'array'];
    }

    /** @return BelongsTo<Store, $this> */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
