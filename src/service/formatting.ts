export function padded(
    number: number,
    base: number = 2,
    padding: number = 8
): string {
    return number.toString(base).padStart(padding, '0');
}
