<?php

namespace App\Support;

use InvalidArgumentException;

final class MoneyAmount
{
    public static function toMinorUnits(string|int $amount): int
    {
        $amount = (string) $amount;

        if (! preg_match('/^\d{1,13}(?:\.\d{1,2})?$/', $amount)) {
            throw new InvalidArgumentException('Amount must be a non-negative decimal with at most two places.');
        }

        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '0');

        return ((int) $whole * 100) + (int) str_pad($fraction, 2, '0');
    }

    public static function fromMinorUnits(int $amount): string
    {
        return intdiv($amount, 100).'.'.str_pad((string) ($amount % 100), 2, '0', STR_PAD_LEFT);
    }
}
