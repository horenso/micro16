<script setup lang="ts">
import { ref } from 'vue';

const registers = ref(new Int16Array(16));

</script>

<template>
    <h1>Memory</h1>
    <table>
        <tr>
            <th>Address</th>
            <th>Value</th>
            <th>Edit</th>
        </tr>
        <tr v-for="(number, index) in memory">
            <td>{{ padded(index, 2) }}</td>
            <td>{{ padded(number, 2) }}</td>
            <td><button>Edit</button></td>
        </tr>
    </table>
</template>

<style scoped>
table,
th,
td {
    border: 1px solid black;
    border-collapse: collapse;
}
</style>
