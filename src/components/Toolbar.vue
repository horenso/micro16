<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { useMemoryStore } from '@/stores/memory';
import { useRegistersStore } from '@/stores/registers';
import { useCodeStore } from '@/stores/code';
import { useCpuStore } from '@/stores/cpu';
import { createPinia } from 'pinia';

const settingsStore = useSettingsStore();
const cpuStore = useCpuStore();
const memoryStore = useMemoryStore();
const registersStore = useRegistersStore();
const codeStore = useCodeStore();

function junk() {
    memoryStore.junk();
    registersStore.junk();
}

function reset() {
    memoryStore.$reset();
    registersStore.$reset();
    cpuStore.$reset();
}

function toggleCpu() {
    if (!cpuStore.isActivated) {
        cpuStore.$reset();
        cpuStore.activate();
    } else {
        cpuStore.deactivate();
    }
}

function undo() {
    console.log('undo');
}

function redo() {
    console.log('redo');
}

function step() {
    cpuStore.runInstruction();
}
</script>

<template>
    <div class="toolbar">
        <select v-model.number="settingsStore.numberSystem">
            <option value="2">Binary</option>
            <option value="10">Decimal</option>
            <option value="16">Hexadecimal</option>
        </select>
        <button @click="codeStore.assemble">Assemble</button>
        <button @click="undo">Undo</button>
        <button @click="redo">Redo</button>
        <button @click="junk">Junk</button>
        <button @click="reset">Reset</button>
        <button @click="toggleCpu" :disabled="codeStore.isDirty">
            {{ cpuStore.isActivated ? 'Turn off' : 'Turn on' }}
        </button>
        <button @click="step" :disabled="!cpuStore.isActivated">Step</button>
    </div>
</template>

<style scoped>
.toolbar {
    display: flex;
    gap: 1em;
    background: grey;
    padding: 1em;
}
</style>
