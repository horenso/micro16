import { defineStore } from 'pinia';

export const useCpuStore = defineStore('cpu', {
    state: () => ({
        MAR: 0,
        MBR: 0,
        A: 0,
        B: 0,
        S: 0,
    }),
});
