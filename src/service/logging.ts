const doLogging = import.meta.env.MODE === 'development';

export function log(message: any): void {
    if (doLogging) {
        console.log(message);
    }
}

export function logTable(structure: any[]): void {
    if (doLogging) {
        console.table(structure);
    }
}
