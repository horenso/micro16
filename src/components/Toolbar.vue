<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { useMemoryStore } from '@/stores/memory';
import { useRegistersStore } from '@/stores/registers';
import { useCodeStore } from '@/stores/code';
import { useCpuStore } from '@/stores/cpu';

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

function run() {
    cpuStore.isRunning = !cpuStore.isRunning;
}

function step() {
    cpuStore.step();
}
</script>

<template>
    <div class="toolbar">
        <select v-model.number="settingsStore.numberSystem">
            <option value="2">Binary</option>
            <option value="10">Decimal</option>
            <option value="16">Hexadecimal</option>
        </select>
        <button @click="codeStore.assemble">
            Download <font-awesome-icon icon="fa-floppy-disk" />
        </button>
        <button @click="codeStore.assemble">
            Assemble <font-awesome-icon icon="fa-gear" />
        </button>
        <button @click="undo">
            <font-awesome-icon icon="fa-rotate-left" />
        </button>
        <button @click="redo">
            <font-awesome-icon icon="fa-rotate-right" />
        </button>
        <button @click="junk">Junk</button>
        <button @click="reset">Reset</button>
        <button
            @click="toggleCpu"
            :disabled="codeStore.isDirty || codeStore.code === ''"
        >
            {{ cpuStore.isActivated ? 'Turn off' : 'Turn on' }}
        </button>
        <button @click="run" :disabled="!cpuStore.isActivated">
            <template v-if="!cpuStore.isRunning">
                <font-awesome-icon icon="fa-solid fa-play" /> Run</template
            >
            <template v-else
                ><font-awesome-icon icon="fa-solid fa-pause" /> Pause</template
            >
        </button>
        <button
            @click="step"
            :disabled="!cpuStore.isActivated || cpuStore.isRunning"
        >
            Step
        </button>
    </div>
</template>

<style scoped>
.toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em;
    background: #b1c6d0;
    padding: 0.5em;
}

button {
    padding: 0.5em;
}
</style>
