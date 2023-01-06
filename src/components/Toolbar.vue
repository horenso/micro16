<script setup lang="ts">
import { ref } from "vue";
</script>

<template>
  <button>Reset</button>
  Clock speed: <input /> Hz
  <select>
    <option value="2">Binary</option>
    <option value="10">Decimal</option>
    <option value="16">Hexadecimal</option>
  </select>
</template>

<style scoped></style>
