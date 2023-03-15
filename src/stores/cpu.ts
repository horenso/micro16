import { defineStore } from 'pinia';
import { disassemble } from '@/service/assembler/disassembler';
import { useRegistersStore } from './registers';
import { useCodeStore } from './code';
import { useSettingsStore } from './settings';
import { useMemoryStore } from './memory';

interface CpuStore {
    MAR: number;
    MBR: number;
    A: number;
    B: number;
    S: number;
    MIC: number;
    MIR: number;
    isActivated: boolean;
    isRunning: boolean;
    runTimer?: NodeJS.Timer;
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
        isRunning: false,
        runTimer: undefined,
    }),
    actions: {
        activate(): void {
            const code = useCodeStore();
            this.isActivated = !code.isDirty && code.code !== '';
        },
        deactivate(): void {
            this.isRunning = false;
            this.isActivated = false;
            clearInterval(this.runTimer);
            this.runTimer = undefined;
        },
        step(): void {
            this.executeInstruction();
        },
        run(): void {
            // Clear timer, this way it's safe to call run() multiple times.
            clearInterval(this.runTimer);
            this.runTimer = undefined;

            this.isRunning = true;
            const settingsStore = useSettingsStore();
            const codeStore = useCodeStore();
            this.runTimer = setInterval(() => {
                if (codeStore.breakpoints.has(this.MIC)) {
                    this.pause();
                    console.log('breakpoint found at ', this.MIC);
                    return;
                }
                this.executeInstruction();
            }, 1000 / settingsStore.frequency);
        },
        pause(): void {
            clearInterval(this.runTimer);
            this.runTimer = undefined;
            this.isRunning = false;
        },
        executeInstruction(): void {
            // Reset state
            this.A = 0;
            this.B = 0;
            this.S = 0;

            if (!this.isActivated) {
                return;
            }
            const registersStore = useRegistersStore();
            const codeStore = useCodeStore();
            const memoryStore = useMemoryStore();

            // Last line reached or jumped outside
            if (this.MIC >= codeStore.assembledCode.length - 1) {
                this.deactivate();
            }
            this.MIR = codeStore.assembledCode[this.MIC];
            const inst = disassemble(this.MIR);

            // Load values onto A and B bus
            this.A = registersStore.at(inst.busA);
            this.B = registersStore.at(inst.busB);

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

            // Read / Write
            if (inst.readWrite !== undefined) {
                const memoryStore = useMemoryStore();
                if (inst.readWrite === 'rd') {
                    const read = memoryStore.readAccess(this.MAR);
                    if (read !== undefined) {
                        this.MBR = read;
                    }
                } else {
                    memoryStore.writeAccess(this.MAR, this.MBR);
                }
            }

            // Write S out to register
            if (inst.ensFlag) {
                registersStore.set(inst.busS, this.S);
            }
        },
    },
});
