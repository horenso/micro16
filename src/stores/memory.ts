import { defineStore } from 'pinia';

export const CAPACITY = 2 ** 16;

interface Access {
    type: 'rd' | 'wr';
    address: number;
}

interface MemoryState {
    memory: number[];
    lastAccess?: Access;
}

export const useMemoryStore = defineStore('memory', {
    state: (): MemoryState => ({
        memory: new Array(CAPACITY).fill(0),
        lastAccess: undefined,
    }),
    getters: {
        at: (state) => {
            return (index: number) => state.memory[index];
        },
    },
    actions: {
        junk(): void {
            for (let i = 0; i < CAPACITY; i++) {
                this.memory[i] = Math.floor(Math.random() * (2 ** 16 - 1));
            }
        },
        readAccess(address: number): number | undefined {
            if (address < 0 || address > CAPACITY) {
                return undefined;
            }
            if (
                this.lastAccess?.type !== 'rd' ||
                this.lastAccess.address !== address
            ) {
                this.lastAccess = { type: 'rd', address: address };
                return undefined;
            }
            // Same access the second cycle in a row
            this.lastAccess = undefined;
            return this.memory[address];
        },
        writeAccess(address: number, value: number): void {
            if (address < 0 || address > CAPACITY) {
                return undefined;
            }
            if (
                this.lastAccess?.type === 'wr' &&
                this.lastAccess.address === address
            ) {
                this.memory[address] = value;
                this.memory = this.memory;
                this.lastAccess = undefined;
            } else {
                this.lastAccess = { type: 'wr', address: address };
            }
        },
    },
});
