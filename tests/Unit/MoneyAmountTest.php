use App\Support\MoneyAmount;

test('money amounts are converted without floating point arithmetic', function () {
    expect(MoneyAmount::toMinorUnits('123.45'))->toBe(12345)
        ->and(MoneyAmount::fromMinorUnits(12345))->toBe('123.45');
});

test('money amounts with more than two decimal places are rejected', function () {
    expect(fn () => MoneyAmount::toMinorUnits('10.999'))
        ->toThrow(InvalidArgumentException::class);
});
