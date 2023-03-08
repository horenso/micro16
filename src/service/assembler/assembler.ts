import { getRegisterIndex } from '@/service/registers';
import { Result } from '@/service/result-type';
import { AnalyzedInstruction } from './types';

export function assemble(inst: AnalyzedInstruction): number {
    let result = 0;

    if (inst.readWrite === 'rd') {
        result |= 0x0060_0000;
    } else if (inst.readWrite === 'wr') {
        result |= 0x0020_0000;
    }

    const jump = inst.jump;
    if (jump !== undefined) {
        if (jump.condition === 'N') {
            result |= 0x2000_0000;
        } else if (jump.condition === 'Z') {
            result |= 0x4000_0000;
        } else {
            result |= 0x6000_0000;
        }
        result |= jump.toAddress;
    }

    if (inst.operator === '+') {
        result |= 0x0800_0000;
    } else if (inst.operator === '~') {
        result |= 0x1800_0000;
    } else if (inst.operator === '&') {
        result |= 0x1000_0000;
    }

    if (inst.shift === 'lsh') {
        result |= 0x0200_0000;
    } else if (inst.shift === 'rsh') {
        result |= 0x0400_0000;
    }

    result |= getRegisterIndex(inst.busA) << 8;
    result |= getRegisterIndex(inst.busB) << 12;
    result |= getRegisterIndex(inst.busS) << 16;
    if (inst.busS !== 'ZERO') {
        result |= 0x0010_0000; // ENS
    }

    if (inst.marFlag) {
        result |= 0x0080_0000;
    }
    if (inst.mbrFlag) {
        result |= 0x0100_0000;
    }
    if (inst.aMuxFlag) {
        result |= 0x8000_0000;
    }

    return result & -1;
}
