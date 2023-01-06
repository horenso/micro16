export function padded(
    number: number,
    base: number = 2,
    padding: number = 8
): string {
    if (number === undefined) {
        return "";
    }
    console.log(number);
    return number.toString(base).padStart(padding, '0');
}
