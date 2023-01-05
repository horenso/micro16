<script setup lang="ts">
import { ref } from 'vue';
import { padded } from '../service/formatting';

const TABLE_SIZE = 30;
const offset = ref(0);
const memory = ref(new Int16Array(20));

</script>

<template>
    <h1>Memory</h1>
    Memory from state: <input type="number" v-model="offset" />
    {{ offset }}
    <div class="wrapper">
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
    </div>

</template>

<style scoped>
table,
th,
td {
    border: 1px solid black;
    border-collapse: collapse;
}

.wrapper {
    height: 300px;
    width: 400px;
    overflow: scroll;
}
</style>
