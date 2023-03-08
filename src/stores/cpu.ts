import { defineStore } from 'pinia';
import { disassemble } from '@/service/assembler/disassembler';
import { useMemoryStore } from './memory';
import { useRegistersStore } from './registers';
import { useCodeStore } from './code';

interface CpuState {
    MAR: number;
    MBR: number;
    A: number;
    B: number;
    S: number;
    MIC: number;
    MIR: number;
}

const memory = useMemoryStore();
const registers = useRegistersStore();
const code = useCodeStore();

export const useCpuStore = defineStore('cpu', {
    state: (): CpuState => ({
        MAR: 0,
        MBR: 0,
        A: 0,
        B: 0,
        S: 0,
        MIC: 0,
        MIR: 0,
    }),
    actions: {
        runInstruction() {
            const fetchedInstruction = code.assembledCode[this.MIC];
            this.MIR =
                fetchedInstruction !== undefined ? fetchedInstruction : 0;
            const disassembled = disassemble(this.MIR);

            // this.MIC =
        },
    },
});
