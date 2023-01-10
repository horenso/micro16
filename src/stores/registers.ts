import { defineStore } from 'pinia'

export const REGISTER_NAMES = [
    "PC",
    "R0",
    "R1",
    "R2",
    "R3",
    "R4",
    "R5",
    "R6",
    "R7",
    "R8",
    "R9",
    "R10",
    "AC",
];
export const REGISTER_COUNT = REGISTER_NAMES.length;

export const useRegistersStore = defineStore('registers', {
    state: () => ({
        registers: new Int16Array(14),
    }), getters: {
        at: (state) => { return (index: number) => state.registers[index] }
    }
});