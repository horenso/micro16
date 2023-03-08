export function formatNumber(
    number: number,
    base: number = 2,
    bits: number = 16
): string {
    if (number === undefined) {
        return '';
    }
    switch (base) {
        case 2:
            return truncate(number >>> 0, bits)
                .toString(2)
                .padStart(bits, '0');
        case 16:
            return truncate(number >>> 0, bits)
                .toString(16)
                .toUpperCase()
                .padStart(bits / 4, '0');
        case 10: // base 10
            return number.toString(base);
        default:
            return '?';
    }
}

function truncate(number: number, bits: number) {
    let truncation = -1;
    if (bits < 32) {
        truncation = (1 << bits) - 1;
        return number & truncation;
    }
    return number;
}
