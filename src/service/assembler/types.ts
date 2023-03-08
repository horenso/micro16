import { Readable, RegisterOrConstant, Writable } from '@/service/registers';

const OPERATOR = ['+', '&', '~'] as const;
export type Operator = typeof OPERATOR[number];
export function isOperator(str?: string): str is Operator {
    if (str === undefined) {
        return false;
    }
    return OPERATOR.some((a) => a === str);
}

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
    ensFlag: boolean;
    jump?: Jump;
    readWrite?: 'rd' | 'wr';
}

export interface DisassembledInstruction {
    busA: number;
    busB: number;
    busS: number;
    operator?: Operator;
    shift?: Shift;
    marFlag: boolean;
    mbrFlag: boolean;
    aMuxFlag: boolean;
    ensFlag: boolean;
    jump?: Jump;
    readWrite?: 'rd' | 'wr';
}
