<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatNumber } from '@/service/formatting';
import { useSettingsStore } from '@/stores/settings';
import { CAPACITY, useMemoryStore } from '@/stores/memory';
import { useRegistersStore } from '@/stores/registers';
import { storeToRefs } from 'pinia';

const TABLE_SIZE = 10;
const MAX_OFFSET = CAPACITY - TABLE_SIZE;

const offset = ref(0);
const offsetComputed = computed(() => {
    return isNaN(offset.value) ? 0 : offset.value;
});

const { at } = storeToRefs(useMemoryStore());

const settings = useSettingsStore();

function updateOffset(event: Event) {
    const newValue = parseInt(event.target.value);
    if (newValue < 0) {
        offset.value = 0;
    } else if (newValue > MAX_OFFSET) {
        offset.value = MAX_OFFSET;
    } else {
        offset.value = newValue;
    }
}

function scrollDown(event) {
    const wheelDelta = Math.ceil(event.wheelDelta);
    const newOffset = Math.trunc(offset.value - wheelDelta * 0.1);
    if (wheelDelta > 0) {
        offset.value = newOffset < 0 ? 0 : newOffset;
    } else {
        offset.value = newOffset > MAX_OFFSET ? MAX_OFFSET : newOffset;
    }
}
</script>

<template>
    Jump to:
    <input
        type="number"
        v-model="offset"
        @input="updateOffset"
        min="0"
        :max="MAX_OFFSET"
    />
    <table v-on:wheel.prevent="scrollDown">
        <tr>
            <th>Address</th>
            <th>Value</th>
        </tr>
        <tr v-for="(_, i) in TABLE_SIZE">
            <td class="numberValue">
                {{ formatNumber(i + offsetComputed, settings.numberSystem) }}
            </td>
            <td class="numberValue">
                {{
                    formatNumber(at(i + offsetComputed), settings.numberSystem)
                }}
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
