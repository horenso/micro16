<script setup lang="ts">
import { formatNumber } from '@/service/formatting';
import { useCpuStore } from '@/stores/cpu';
import { useRegistersStore, REGISTER_NAMES } from '@/stores/registers';
import { useSettingsStore } from '@/stores/settings';
import { storeToRefs } from 'pinia';

const { all } = storeToRefs(useRegistersStore());
const settingsStore = useSettingsStore();
</script>

<template>
    <table>
        <tr>
            <th>Register</th>
            <th>Value</th>
        </tr>
        <tr v-for="tuple of all">
            <td>{{ tuple[0] }}</td>
            <td class="numberValue">
                {{ formatNumber(tuple[1], settingsStore.numberSystem) }}
            </td>
        </tr>
    </table>
</template>

<style scoped>
table,
th,
td {
    border: 1px solid black;
    border-collapse: collapse;
    font-family: 'Courier New', monospace;
}

table {
    margin: 1em;
}
</style>
