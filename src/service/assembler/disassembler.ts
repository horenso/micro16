import { DisassembledInstruction, Jump, Operator, Shift } from './types';

function getJump(inst: number): Jump | undefined {
    const toAddress = inst & 0x0000_00ff;
    if (toAddress === 0) {
        return undefined;
    }
    const conditionEncoded = inst & 0x6000_0000;
    let condition: undefined | 'N' | 'Z' = undefined;
    if (conditionEncoded == 0x2000_0000) {
        condition = 'N';
    } else if (conditionEncoded == 0x4000_0000) {
        condition = 'Z';
    }
    return { condition: condition, toAddress: toAddress };
}

function getOperator(inst: number): Operator | undefined {
    const operatorEncoded = inst & 0x1800_0000;
    if (operatorEncoded === 0x0800_0000) {
        return '+';
    }
    if (operatorEncoded === 0x1800_0000) {
        return '~';
    }
    if (operatorEncoded === 0x1000_0000) {
        return '&';
    }
    return undefined;
}

function getShift(inst: number): Shift | undefined {
    const shiftEncoded = inst & 0x0600_0000;
    if (shiftEncoded === 0) {
        return undefined;
    }
    if (shiftEncoded === 0x0200_0000) {
        return 'lsh';
    }
    if (shiftEncoded === 0x0400_0000) {
        return 'rsh';
    }
}

function getReadWrite(inst: number): 'rd' | 'wr' | undefined {
    const readWriteEncoded = inst & 0x0060_0000;
    if (readWriteEncoded === 0x0060_0000) {
        return 'rd';
    }
    if (readWriteEncoded === 0x0020_0000) {
        return 'wr';
    }
    return undefined;
}

export function disassemble(inst: number): DisassembledInstruction {
    return {
        busA: (inst & 0x0000_0f00) >> 8,
        busB: (inst & 0x0000_f000) >> 12,
        busS: (inst & 0x000f_0000) >> 16,
        operator: getOperator(inst),
        shift: getShift(inst),
        marFlag: (inst & 0x0080_0000) !== 0,
        mbrFlag: (inst & 0x0100_0000) !== 0,
        aMuxFlag: (inst & 0x8000_0000) !== 0,
        ensFlag: (inst & 0x0010_0000) !== 0,
        jump: getJump(inst),
        readWrite: getReadWrite(inst),
    };
}
