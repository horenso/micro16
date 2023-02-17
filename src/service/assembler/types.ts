import { Readable, Writable } from '../registers';

export type Shift = 'left' | 'right';
const OPERATOR: readonly string[] = ['+', '&', '~'] as const;
export type Operator = typeof OPERATOR[number];

export function isOperator(str?: string): str is Operator {
    if (str === undefined) {
        return false;
    }
    return OPERATOR.includes(str);
}

interface NoOp {
    left: Readable;
    operator?: never;
    right?: never;
}

interface Op {
    left: Readable;
    operator: Operator;
    right: Readable;
}

export type Operation = NoOp | Op;

export type Expression = Operation & { shift?: Shift };

export type Statement = Expression & { dest?: Writable };

export interface Jump {
    condition?: 'N' | 'Z';
    toAddress: number;
}

export interface ParsedInstruction {
    statements: Statement[];
    jump?: Jump;
    readWrite?: 'rd' | 'wr';
}

export type Result<T> =
    | { ok: true; result: T }
    | { ok: false; errorMessage: string };

export function Ok<T>(result: T): Result<T> {
    return { ok: true, result: result };
}

export function Err<T>(message: string): Result<T> {
    return { ok: false, errorMessage: message };
}
