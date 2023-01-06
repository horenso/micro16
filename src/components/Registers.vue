<script setup lang="ts">
import { ref } from "vue";
import { padded } from "../service/formatting";

const REGISTER_NAMES = [
  "PC",
  "R0",
  "R1",
  "R2",
  "R3",
  "R4",
  "R5",
  "R6",
  "R7",
  "R8",
  "R9",
  "R10",
  "AC",
];
const REGISTER_COUNT = REGISTER_NAMES.length;

const registers = ref(new Int16Array(REGISTER_COUNT));
</script>

<template>
  <h1>Registers</h1>
  <table>
    <tr>
      <th>Register</th>
      <th>Value</th>
    </tr>
    <tr v-for="(number, index) in registers">
      <td>{{ REGISTER_NAMES[index] }}</td>
      <td>{{ padded(number, 2, 16) }}</td>
    </tr>
  </table>
</template>

<style scoped>
table,
th,
td {
  border: 1px solid black;
  border-collapse: collapse;
  font-family: "Courier New", monospace;
}
</style>
