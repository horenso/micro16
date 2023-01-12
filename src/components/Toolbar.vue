<script setup lang="ts">
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings";
import { useMemoryStore } from "../stores/memory";
import { useRegistersStore } from "../stores/registers";
import { useCodeStore } from "../stores/code";

const settings = useSettingsStore();
const memory = useMemoryStore();
const registers = useRegistersStore();
const code = useCodeStore();

function junk() {
    memory.junk();
    registers.junk();
}

function reset() {
    memory.$reset();
    registers.$reset();
}

function undo() {
    console.log("undo");
}

function redo() {
    console.log("redo");
}
</script>

<template>
    <div class="toolbar">
        <select v-model.number="settings.numberSystem">
            <option value=2>Binary</option>
            <option value=10>Decimal</option>
            <option value=16>Hexadecimal</option>
        </select>
        <button @click="code.assemble()">Assemle</button>
        <button @click="undo">Undo</button>
        <button @click="redo">Redo</button>
        <button @click="junk">Junk</button>
        <button @click="reset">Flash</button>
  </div>
</template>

<style scoped>
.toolbar{
    display: flex;
    gap: 1em;
    background: grey;
    padding: 1em;
}</style>
