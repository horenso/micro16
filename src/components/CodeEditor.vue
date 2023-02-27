<script setup lang="ts">
import { ref } from 'vue';
import { useCodeStore } from '../stores/code';

const codeStore = useCodeStore();
</script>

<template>
    <h1>Coding Editor</h1>
    <div class="wrapper">
        <textarea class="editor" v-model="codeStore.code"></textarea>
        <div class="assemledCode">{{ codeStore.assembledCodeString }}</div>
    </div>
</template>

<style scoped>
.wrapper {
    margin: 0 1em 0 1em;
    display: flex;
    gap: 1em;
}
.editor {
    outline: 1px solid black;
    width: 300px;
    font-family: 'Courier New', monospace;
}
.assemledCode {
    outline: 1px solid black;
    width: 80%;
    padding: 0 0.5ch 0 0.5ch;
    white-space: pre;
    font-family: 'Courier New', monospace;
}
</style>
