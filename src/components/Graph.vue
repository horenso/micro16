<script setup lang="ts">
import { ref, computed } from "vue";

const box1Visable = ref(true);
const box2Visable = ref(true);

function boolToVisableHidden(visable: boolean): string {
    return visable ? 'visable' : 'hidden';
}

function buttonName(visable: boolean): string {
    return visable ? 'Hide' : 'Show';
}

</script>

<template>
    <button @click="box1Visable = !box1Visable">{{ buttonName(box1Visable) }}</button>
    <button @click="box2Visable = !box2Visable">{{ buttonName(box2Visable) }}</button>

    <p>
        <svg width="200px" height="200px" version="1.1" id="svg5" sodipodi:docname="test.svg">
            <rect id="rect1" width="70.0" height="60.0" x="25.0" y="80.0"
                :visibility="boolToVisableHidden(box1Visable)" />
            <rect id="rect2" width="70.0" height="60.0" x="70.0" y="125.0"
                :visibility="boolToVisableHidden(box2Visable)" />
        </svg>
    </p>
</template>

<style scoped>
svg {
    border: 1px solid black;
}

#rect1 {
    fill: #0000ff;
}

#rect2 {
    fill: #00ff00;
}
</style>