const mode = import.meta.env.MODE;

export function log(message: any): void {
    if (mode !== 'production') {
        console.log(message);
    }
}

export function logTable(structure: any[]): void {
    if (mode !== 'production') {
        console.table(structure);
    }
}
