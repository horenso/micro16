import { defineStore } from 'pinia';

export const REGISTER_NAMES = [
    'PC',
    'R0',
    'R1',
    'R2',
    'R3',
    'R4',
    'R5',
    'R6',
    'R7',
    'R8',
    'R9',
    'R10',
    'AC',
];
export const REGISTER_COUNT = REGISTER_NAMES.length;

export const useRegistersStore = defineStore('registers', {
    state: () => ({
        registers: new Int16Array(13),
    }),
    getters: {
        at: (state) => {
            return (index: number) => {
                if (index === 0) {
                    return 0;
                } else if (index === 1) {
                    return 1;
                } else if (index === 2) {
                    return -1;
                } else {
                    return state.registers[index + 3];
                }
            };
        },
    },
    actions: {
        junk(): void {
            const newRegisters = new Int16Array(REGISTER_COUNT);
            for (let i = 0; i < REGISTER_COUNT; i++) {
                newRegisters[i] = Math.floor(Math.random() * (2 ** 16 - 1));
            }
            this.registers = newRegisters;
        },
        set(index: number, newValue: number): void {
            if (index < 0 || index > 13) {
                console.log('Invalid SET of register!', index);
                return;
            }
            this.registers[index] = newValue;
        },
    },
});
