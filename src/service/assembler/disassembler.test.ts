import { test, expect } from 'vitest';
import { getRegisterIndex } from '../registers';
import { disassemble } from './disassembler';
import { AnalyzedInstruction, DisassembledInstruction } from './types';

function testDisassemble(inst: number, result: DisassembledInstruction) {
    expect(disassemble(inst & -1)).toMatchObject(result);
}

test('Disassembling tests', () => {
    // R1 <- R2 + R3; rd
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
