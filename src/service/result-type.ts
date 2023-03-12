export type Success<T> = { ok: true; result: T };
export type Failure<T> = { ok: false; errorMessage: string };

export type Result<T> = Success<T> | Failure<T>;

export type EmptyResult = { ok: true } | { ok: false; errorMessage: string };

export function Ok<T>(result: T): Result<T> {
    return { ok: true, result };
}

export function EmptyOk(): EmptyResult {
    return { ok: true };
}

export function Err<T>(errorMessage: string): Result<T> {
    return { ok: false, errorMessage };
}
