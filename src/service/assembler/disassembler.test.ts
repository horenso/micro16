import { test, expect } from 'vitest';
import { getRegisterIndex } from '../registers';
import { disassemble } from './disassembler';
import { AnalyzedInstruction, DisassembledInstruction } from './types';

function testDisassemble(inst: number, result: DisassembledInstruction) {
    expect(disassemble(inst & -1)).toMatchObject(result);
}

test('R1 <- R2 + R3; rd', () => {
    const expected: DisassembledInstruction = {
        busA: getRegisterIndex('R2'),
        busB: getRegisterIndex('R3'),
        busS: getRegisterIndex('R1'),
        operator: '+',
        shift: undefined,
        marFlag: false,
        mbrFlag: false,
        aMuxFlag: false,
        ensFlag: true,
        jump: undefined,
        readWrite: 'rd',
    };
    testDisassemble(0x0875_7600, expected);
});

test('rsh(~0); wr; if N goto 200', () => {
    const expected: DisassembledInstruction = {
        busA: getRegisterIndex('ZERO'),
        busB: getRegisterIndex('ZERO'),
        busS: getRegisterIndex('ZERO'),
        operator: '~',
        shift: 'rsh',
        marFlag: false,
        mbrFlag: false,
        aMuxFlag: false,
        ensFlag: false,
        jump: {
            toAddress: 200,
            condition: 'N',
        },
        readWrite: 'wr',
    };
    testDisassemble(0x3c20_00c8, expected);
});

test('MAR<-R6; MBR<-R8; R1<-R8', () => {
    const expected: DisassembledInstruction = {
        busA: getRegisterIndex('R8'),
        busB: getRegisterIndex('R6'),
        busS: getRegisterIndex('R1'),
        operator: undefined,
        shift: undefined,
        marFlag: true,
        mbrFlag: true,
        aMuxFlag: false,
        ensFlag: true,
        jump: undefined,
        readWrite: undefined,
    };
    testDisassemble(0x0195_ac00, expected);
});

test('MBR + 1', () => {
    const expected: DisassembledInstruction = {
        busA: getRegisterIndex('ZERO'),
        busB: getRegisterIndex('ONE'),
        busS: getRegisterIndex('ZERO'),
        operator: '+',
        shift: undefined,
        marFlag: false,
        mbrFlag: false,
        aMuxFlag: true,
        ensFlag: false,
        jump: undefined,
        readWrite: undefined,
    };
    testDisassemble(0x8800_1000, expected);
});
