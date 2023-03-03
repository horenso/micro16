import { Location, Readable, RegisterOrConstant, Writable } from '../registers';

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

interface LocationToken {
    type: 'LOCATION';
    location: Location;
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

interface UnaryOperatorToken {
    type: 'UNARY_OPERATOR';
    operator: '~';
}

interface BinaryOperatorToken {
    type: 'BINARY_OPERATOR';
    operator: '+' | '&';
}

interface JumpAddressToken {
    type: 'JUMP_ADDRESS';
    number: number;
}

export type Token =
    | SimpleToken
    | LocationToken
    | ReadWriteToken
    | ConditionToken
    | FunctionToken
    | UnaryOperatorToken
    | BinaryOperatorToken
    | JumpAddressToken;

export type Shift = 'lsh' | 'rsh';

interface NoOperation {
    left: Readable;
    operator?: never;
    right?: never;
}

interface UnaryOperation {
    left: Readable;
    operator: '~';
    right?: never;
}

interface BinaryOperation {
    left: Readable;
    operator: '+' | '&';
    right: Readable;
}

export type Operation = NoOperation | UnaryOperation | BinaryOperation;

export type Expression = Operation & { shift?: Shift };

export type Statement = Expression & { dest?: Writable };

export interface Jump {
    condition?: 'N' | 'Z';
    toAddress: number;
}

// This represents the structure of an Instruction how it is parsed by the parser.
export interface ParsedInstruction {
    statements: Statement[];
    jump?: Jump;
    readWrite?: 'rd' | 'wr';
}

// An AnalyzedInstruction has already assigned all the buses and mar/mbr/a-mux flags.
export interface AnalyzedInstruction {
    busA: RegisterOrConstant;
    busB: RegisterOrConstant;
    busS: RegisterOrConstant;
    operator?: Operator;
    shift?: Shift;
    marFlag: boolean;
    mbrFlag: boolean;
    aMuxFlag: boolean;
    jump?: Jump;
    readWrite?: 'rd' | 'wr';
}

export type Result<T> =
    | { ok: true; result: T }
    | { ok: false; errorMessage: string };

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
