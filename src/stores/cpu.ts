import { defineStore } from 'pinia';

interface CpuState {
    MAR: number;
    MBR: number;
    A: number;
    B: number;
    S: number;
}

export const useCpuStore = defineStore('cpu', {
    state: (): CpuState => ({
        MAR: 0,
        MBR: 0,
        A: 0,
        B: 0,
        S: 0,
    }),
});
