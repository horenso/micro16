<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import { padded } from "../service/formatting";

const CAPACITY = 2 ** 16;
const TABLE_SIZE = 10;
const MAX_OFFSET = CAPACITY - TABLE_SIZE;

const offset = ref(0);
const memory = ref(new Int16Array(CAPACITY));

onBeforeMount(() => {
  for (let i = 0; i < CAPACITY; i++) {
    memory.value[i] = Math.floor(Math.random() * 10000);
  }
});

function updateOffset(event) {
  const newValue = parseInt(event.target.value);
  if (isNaN(newValue)) {
    offset.value = 0;
  } else if (newValue < 0) {
    offset.value = 0;
  } else if (newValue > MAX_OFFSET) {
    offset.value = MAX_OFFSET;
  } else {
    offset.value = newValue;
  }
}
</script>

<template>
  <h1>Memory</h1>
  Memory from state:
  <input type="number" v-model="offset" @input="updateOffset" min="0" :max="MAX_OFFSET" />
  <div class="wrapper">
    <table>
      <tr>
        <th>Address</th>
        <th>Value</th>
        <th>Edit</th>
      </tr>
      <tr v-for="(_, i) in TABLE_SIZE">
        <td>{{ padded(i + offset, 2, 16) }}</td>
        <td>{{ padded(memory[i + offset], 2, 16) }}</td>
        <td><button>Edit</button></td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
table,
th,
td {
  border: 1px solid black;
  border-collapse: collapse;
  font-family: "Courier New", monospace;
}

.wrapper {
  height: 300px;
  width: 400px;
  overflow: scroll;
}
</style>
