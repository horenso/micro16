import { defineStore } from 'pinia';

export const CAPACITY = 2 ** 16;

export const useMemoryStore = defineStore('memory', {
    state: () => ({
        memory: new Int16Array(CAPACITY),
    }), getters: {
        at: (state) => { return (index: number) => state.memory[index] }
    }, actions: {
        junk() {
            const newMemory = new Int16Array(CAPACITY);
            for (let i = 0; i < CAPACITY; i++) {
                newMemory[i] = Math.floor(Math.random() * ((2**16)-1));
            }
            this.memory = newMemory;
        },
    }
});