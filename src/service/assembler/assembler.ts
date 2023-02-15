import { RegisterOrConstant } from '../registers';
import { parseLine } from './parser';
import { AssemblingResult, ParsedInstruction } from './types';

export class Assembler {
    private instruction: ParsedInstruction;
    private result: number = 0;

    private busA: RegisterOrConstant | null = null;
    private busB: RegisterOrConstant | null = null;

    constructor(instruction: ParsedInstruction) {
        this.instruction = instruction;
    }

    private assembleStatements(): void {
        for (let stmt of this.instruction.statements) {
            if (stmt.type === 'PassThrough') {
            } else if (stmt.type === 'Assignment') {
            }
        }
    }

    public assemble(): AssemblingResult {
        const readWrite = this.instruction.readWrite;
        if (readWrite === 'rd') {
            this.result |= 0x0060_0000;
        } else if (readWrite === 'wr') {
            this.result |= 0x0020_0000;
        }

        const jump = this.instruction.jump;
        if (jump !== null) {
            if (jump.condition === 'N') {
                this.result |= 0x2000_0000;
            } else if (jump.condition === 'Z') {
                this.result |= 0x4000_0000;
            } else {
                this.result |= 0x6000_0000;
            }
            this.result |= jump.toAddress;
        }

        // if (this.instruction.mar) {
        //     this.result |= 0x0080_0000;
        // }
        // if (this.instruction.mbr) {
        //     this.result |= 0x0100_0000;
        // }

        return { ok: true, result: this.result };
    }
}
