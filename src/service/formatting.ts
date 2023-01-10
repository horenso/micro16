export function padded(
    number: number,
    base: number = 2,
    padding: number = 8,
    paddWithZeros: boolean = false
): string {
    if (number === undefined) {
        return "";
    }
    const paddingChar = paddWithZeros ? '0' : ' ';
    return number.toString(base).padStart(padding, paddingChar);
}
