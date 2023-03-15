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

const range16 = [];

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
    const offsetMod16 = newOffset + (newOffset % 16);
    if (wheelDelta > 0) {
        offset.value = offsetMod16 < 0 ? 0 : offsetMod16;
    } else {
        offset.value = offsetMod16 > MAX_OFFSET ? MAX_OFFSET : offsetMod16;
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
        step="16"
        :max="MAX_OFFSET"
    />
    <table v-on:wheel.prevent="scrollDown">
        <tr>
            <th>Address</th>
            <th v-for="i in 16">{{ formatNumber(i - 1, 16, 4) }}</th>
        </tr>
        <tr v-for="(_, row) in TABLE_SIZE">
            <td>
                {{
                    formatNumber(
                        row * 16 + offsetComputed,
                        settings.numberSystem
                    )
                }}
            </td>
            <td v-for="(_, col) in 16">
                {{
                    formatNumber(
                        at(row * 16 + col + offsetComputed),
                        settings.numberSystem,
                        16
                    )
                }}
            </td>
        </tr>
    </table>
</template>

<style scoped>
table,
th,
td {
    border: 1px solid rgb(202, 202, 202);
    border-collapse: collapse;
    font-family: 'Courier New', monospace;
}
</style>
