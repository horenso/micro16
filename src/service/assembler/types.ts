import { Readable, Writable } from '../registers';

export type Shift = 'left' | 'right' | null;

export interface PassThroughStatement {
    type: 'PassThrough';
    destination: Readable;
    shift: Shift;
}

const OPERATOR = ['+', '&', '~'] as const;
export type Operator = typeof OPERATOR[number];

export function isOperator(str: string): str is Operator {
    return str in OPERATOR;
}

export interface AssignmentStatement {
    type: 'Assignment';
    destination: Writable;
    left: Readable;
    operator: Operator;
    right: Readable;
    shift: Shift;
}

export type Statement = PassThroughStatement | AssignmentStatement;

export interface Jump {
    condition: 'N' | 'Z' | null;
    toAddress: number;
}

export interface ParsedInstruction {
    statements: Statement[];
    jump: Jump | null;
    readWrite: 'rd' | 'wr' | null;
}

export interface Error {
    message: string;
}

export type ParsingResult =
    | { ok: true; instruction: ParsedInstruction }
    | { ok: false; error: Error };

export type AssemblingResult =
    | { ok: true; result: number }
    | { ok: false; error: Error };
