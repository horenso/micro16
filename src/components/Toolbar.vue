<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { useMemoryStore } from '@/stores/memory';
import { useRegistersStore } from '@/stores/registers';
import { useCodeStore } from '@/stores/code';
import { useCpuStore } from '@/stores/cpu';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';

const settingsStore = useSettingsStore();
const cpuStore = useCpuStore();
const memoryStore = useMemoryStore();
const registersStore = useRegistersStore();
const codeStore = useCodeStore();

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

const { frequency } = storeToRefs(settingsStore);
watch(frequency, () => {
    if (cpuStore.isRunning) {
        cpuStore.run();
    }
});

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
        <button @click="reset">Reset</button>
        <button
            @click="toggleCpu"
            :disabled="codeStore.isDirty || codeStore.code === ''"
        >
            {{ cpuStore.isActivated ? 'Turn off' : 'Turn on' }}
        </button>
        <button
            v-if="!cpuStore.isRunning"
            :disabled="!cpuStore.isActivated"
            @click="cpuStore.run"
        >
            <font-awesome-icon icon="fa-solid fa-play" /> Run
        </button>
        <button
            v-else
            :disabled="!cpuStore.isActivated"
            @click="cpuStore.pause"
        >
            <font-awesome-icon icon="fa-solid fa-pause" /> Pause
        </button>
        <input
            type="number"
            step="1"
            min="1"
            max="20"
            v-model="settingsStore.frequency"
            id="frequency-input"
        /><label for="frequency-input">Hz</label>
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

#frequency-input {
    width: 3em;
}

label {
    display: inline-block;
    align-self: center;
}

div {
    align-self: center;
}
</style>
