const SIXTEEN_BIT = (1<<16)-1

export function formatNumber(
    number: number,
    base: number = 2,
): string {
    if (number === undefined) {
        return "";
    }
    switch (base) {
        case 2: return ((number >>> 0) & SIXTEEN_BIT).toString(2).padStart(16, '0')
        case 16: return ((number >>> 0) & SIXTEEN_BIT).toString(16).toUpperCase().padStart(4, '0')
        default: return number.toString(base);
    }
}
