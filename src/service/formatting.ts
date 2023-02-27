export function formatNumber(
    number: number,
    base: 2 | 10 | 16 = 2,
    bits: number = 16
): string {
    if (number === undefined) {
        return '';
    }
    switch (base) {
        case 2:
            return trancate(number >>> 0, bits)
                .toString(2)
                .padStart(bits, '0');
        case 16:
            return trancate(number >>> 0, bits)
                .toString(16)
                .toUpperCase()
                .padStart(bits / 4, '0');
        default: // base 10
            return number.toString(base);
    }
}

function trancate(number: number, bits: number) {
    let trancation = -1;
    if (bits < 32) {
        trancation = (1 << bits) - 1;
        return number & trancation;
    }
    return number;
}
