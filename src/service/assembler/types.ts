import { Readable, Writable } from '../registers';

export type Shift = 'left' | 'right';
const OPERATOR = ['+', '&', '~'] as const;
export type Operator = typeof OPERATOR[number];

export function isOperator(str: string): str is Operator {
    return str in OPERATOR;
}

export interface NoopExpression {
    left: Readable;
}

export interface OpExpression extends NoopExpression {
    operator: Operator;
    right: Readable;
}

export type Expression = NoopExpression | OpExpression;

interface BaseStatement {
    shift?: Shift;
    dest?: Writable;
}

export type Statement = BaseStatement & Expression;

export interface Jump {
    condition?: 'N' | 'Z';
    toAddress: number;
}

export interface ParsedInstruction {
    statements: Statement[];
    jump?: Jump;
    readWrite?: 'rd' | 'wr';
}

export interface Error {
    message: string;
}

export type Result<T> = { ok: true; result: T } | { ok: false; error: Error };

// export type ParsingResult =
//     | { ok: true; instruction: ParsedInstruction }
//     | { ok: false; error: Error };

// export type AssemblingResult =
//     | { ok: true; result: number }
//     | { ok: false; error: Error };
