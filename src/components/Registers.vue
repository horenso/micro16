<script setup lang="ts">
import { formatNumber } from '@/service/formatting';
import { useRegistersStore, REGISTER_NAMES } from '@/stores/registers';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
const registers = useRegistersStore();
</script>

<template>
    <h1>Registers</h1>
    <table>
        <tr>
            <th>Register</th>
            <th>Value</th>
        </tr>
        <tr v-for="(number, index) in registers.registers">
            <td>{{ REGISTER_NAMES[index] }}</td>
            <td class="numberValue">
                {{ formatNumber(number, settings.numberSystem) }}
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
</style>
