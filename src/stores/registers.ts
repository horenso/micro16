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

function getRegisterValue(index: number, data: number[]): number {
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

interface RegisterStore {
    registers: number[];
}

export const useRegistersStore = defineStore('registers', {
    state: (): RegisterStore => ({
        registers: new Array(STORED_VALUES).fill(0),
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
        set(index: number, newValue: number): void {
            if (index < 3 || index > 15) {
                console.log('Invalid SET of register!', index);
                return;
            }
            this.registers[index - 3] = newValue;
        },
    },
});
