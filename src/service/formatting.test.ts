import { formatNumber } from './formatting';
import { test, expect } from 'vitest';

test('Format -1', () => {
    // 4 Bits
    expect(formatNumber(-1, 2, 4)).toBe('1111');
    expect(formatNumber(-1, 16, 4)).toBe('F');

    // 8 Bits
    expect(formatNumber(-1, 2, 8)).toBe('11111111');
    expect(formatNumber(-1, 16, 8)).toBe('FF');

    // 16 Bits
    expect(formatNumber(-1, 2, 16)).toBe('1111111111111111');
    expect(formatNumber(-1, 16, 16)).toBe('FFFF');

    // 32 Bits
    expect(formatNumber(-1, 2, 32)).toBe('11111111111111111111111111111111');
    expect(formatNumber(-1, 16, 32)).toBe('FFFFFFFF');
});

test('Format 32 bit', () => {
    expect(formatNumber(0xabcd_abcd, 16, 32)).toBe('ABCDABCD');
});
