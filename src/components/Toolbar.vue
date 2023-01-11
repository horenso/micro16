<script setup lang="ts">
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings";
import { useMemoryStore } from "../stores/memory";
import { useRegistersStore } from "../stores/registers";

const settings = useSettingsStore();
const memory = useMemoryStore();
const registers = useRegistersStore();
</script>

<template>
  <button>Reset</button>
  Clock speed: <input /> Hz
  <select v-model.number="settings.numberSystem">
    <option value=2>Binary</option>
    <option value=10>Decimal</option>
    <option value=16>Hexadecimal</option>
  </select>
  <button
    @click="
      memory.junk();
      registers.junk();
    "
  >
    Junk
  </button>
  <button
    @click="
      memory.$reset();
      registers.$reset();
    "
  >
    Flash
  </button>
</template>

<style scoped></style>
