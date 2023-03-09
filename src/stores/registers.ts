import { defineStore } from 'pinia';

export const REGISTER_NAMES = [
    '0',
    '1',
    '-1',
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

const STORED_VALUES = 13;

function getRegisterValue(index: number, data: Int16Array): number {
    if (index === 0) {
        return 0;
    } else if (index === 1) {
        return 1;
    } else if (index === 2) {
        return -1;
    } else {
        return data[index - 3];
    }
}

export const REGISTER_COUNT = REGISTER_NAMES.length;

export const useRegistersStore = defineStore('registers', {
    state: () => ({
        registers: new Int16Array(STORED_VALUES),
    }),
    getters: {
        at: (state) => {
            return (index: number) => getRegisterValue(index, state.registers);
        },
        all: (state): [string, number][] => {
            const collection: [string, number][] = [];
            for (let i = 0; i < 16; i++) {
                collection.push([
                    REGISTER_NAMES[i],
                    getRegisterValue(i, state.registers),
                ]);
            }
            return collection;
        },
    },
    actions: {
        junk(): void {
            const newRegisters = new Int16Array(STORED_VALUES);
            for (let i = 0; i < REGISTER_COUNT; i++) {
                newRegisters[i] = Math.floor(Math.random() * (2 ** 16 - 1));
            }
            this.registers = newRegisters;
        },
        set(index: number, newValue: number): void {
            const newRegisters: Int16Array = Int16Array.from(this.registers);
            if (index < 3 || index > 15) {
                console.log('Invalid SET of register!', index);
                return;
            }
            newRegisters[index - 3] = newValue;
            this.registers = newRegisters;
        },
    },
});
