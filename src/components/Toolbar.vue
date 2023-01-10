<script setup lang="ts">
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings";
import { useMemoryStore } from "../stores/memory";

const settings = useSettingsStore();
const memory = useMemoryStore();
</script>

<template>
    <button>Reset</button>
    Clock speed: <input /> Hz
    <select v-model="settings.numberSystem">
        <option value="2">Binary</option>
        <option value="10">Decimal</option>
        <option value="16">Hexadecimal</option>
    </select>
    Zero Padding: <input type="checkbox" v-model="settings.paddWithZeros" />
    <button @click="memory.junk()">Junk</button>
    <button @click="memory.$reset()">Flash</button>
</template>

<style scoped>

</style>
