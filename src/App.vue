<script setup lang="ts">
import Toolbar from '@/components/Toolbar.vue';
import MemoryTable from '@/components/MemoryTable.vue';
import Registers from '@/components/Registers.vue';
import CodeEditor from '@/components/CodeEditor.vue';
import { useCpuStore } from './stores/cpu';
import { useRegistersStore } from './stores/registers';

const cpuStore = useCpuStore();
const registersStore = useRegistersStore();
</script>

<template>
    <Toolbar />
    <CodeEditor />
    <div class="grid-container">
        <div class="grid-item"><Registers /></div>
        <div class="grid-item"><MemoryTable /></div>
    </div>
    {{ cpuStore.$state }}
</template>

<style scoped>
.grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
}
.grid-item {
    display: inline;
}
</style>
