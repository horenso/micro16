import { defineStore } from 'pinia';
import { disassemble } from '@/service/assembler/disassembler';
import { useRegistersStore } from './registers';
import { useCodeStore } from './code';

interface CpuStore {
    MAR: number;
    MBR: number;
    A: number;
    B: number;
    S: number;
    MIC: number;
    MIR: number;
    isActivated: boolean;
}

export const useCpuStore = defineStore('cpu', {
    state: (): CpuStore => ({
        MAR: 0,
        MBR: 0,
        A: 0,
        B: 0,
        S: 0,
        MIC: 0,
        MIR: 0,
        isActivated: false,
    }),
    actions: {
        activate() {
            const code = useCodeStore();
            this.isActivated = !code.isDirty && code.code !== ''
        },
        deactivate() {
            this.isActivated = false;
        },
        runInstruction() {
            if (!this.isActivated) {
                return;
            }
            const registers = useRegistersStore();
            const code = useCodeStore();

            const fetchedInstruction = code.assembledCode[this.MIC];
            this.MIR =
                fetchedInstruction !== undefined ? fetchedInstruction : 0;
            const inst = disassemble(this.MIR);

            // 1) Load values onto A and B bus
            this.A = registers.at(inst.busA);
            this.B = registers.at(inst.busB);

            // Write to MAR from B
            if (inst.marFlag) {
                this.MAR = this.B;
            }

            // Set A to MBR if AMUX is active
            if (inst.aMuxFlag) {
                this.A = this.MBR;
            }

            // ALU
            switch (inst.operator) {
                case undefined:
                    this.S = this.A;
                    break;
                case '+':
                    this.S = (this.A + this.B) & -1;
                    break;
                case '&':
                    this.S = this.A & this.B;
                    break;
                default: // ~
                    this.S = ~this.A;
                    break;
            }

            // Set N and Z
            const N = this.S < 0;
            const Z = this.S === 0;

            // Set MIC to jump or next address
            if (inst.jump === undefined) {
                this.MIC++;
            } else {
                if (
                    inst.jump.condition === undefined ||
                    (inst.jump.condition === 'N' && N) ||
                    (inst.jump.condition === 'Z' && Z)
                ) {
                    this.MIC = inst.jump.toAddress;
                } else {
                    this.MIC++;
                }
            }

            // Shifter
            if (inst.shift === 'lsh') {
                this.S = this.S << 1;
            } else if (inst.shift === 'rsh') {
                this.S = this.S >> 1;
            }

            // Write to MBR
            if (inst.mbrFlag) {
                this.MBR = this.S;
            }

            // Write S out to register
            if (inst.ensFlag) {
                registers.set(inst.busS, this.S);
            }
        },
    },
});
