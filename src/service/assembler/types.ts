import { Location, Readable, Writable } from '../registers';

const OPERATOR = ['+', '&', '~'] as const;
export type Operator = typeof OPERATOR[number];
export function isOperator(str?: string): str is Operator {
    if (str === undefined) {
        return false;
    }
    return OPERATOR.some((a) => a === str);
}

interface SimpleToken {
    type: 'GOTO' | 'IF' | 'L_PAREN' | 'R_PAREN' | 'ARROW';
}

interface NumberToken {
    type: 'NUMBER';
    number: number;
}

interface LocationToken {
    type: 'LOCATION';
    location: Location;
    readable: boolean;
    writable: boolean;
}

export interface ReadWriteToken {
    type: 'READ_WRITE';
    readWrite: 'rd' | 'wr';
}

interface ConditionToken {
    type: 'CONDITION';
    condition: 'N' | 'Z';
}

interface FunctionToken {
    type: 'FUNCTION';
    name: 'lsh' | 'rsh';
}

interface OperatorToken {
    type: 'OPERATOR';
    operator: Operator;
}

export type Token =
    | SimpleToken
    | NumberToken
    | LocationToken
    | ReadWriteToken
    | ConditionToken
    | FunctionToken
    | OperatorToken;

export type Shift = 'left' | 'right';

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

export type EmptyResult = { ok: true } | { ok: false; errorMessage: string };

export function Ok<T>(result: T): Result<T> {
    return { ok: true, result: result };
}

export function Err<T>(message: string): Result<T> {
    return { ok: false, errorMessage: message };
}

export function EmptyOk(): EmptyResult {
    return { ok: true };
}

export function EmptyErr(message: string): EmptyResult {
    return { ok: false, errorMessage: message };
}
