<script setup lang="ts">
import { ref } from 'vue';
import { useCodeStore } from '../stores/code';
import { useSettingsStore } from '../stores/settings';

const codeStore = useCodeStore();
const settingsStore = useSettingsStore();

const lineNumbersRef = ref(null);
const textareaRef = ref(null);

function onScroll() {
    console.log('onScroll');
    // lineNumbersRef.value.scrollTop = textareaRef.value.scrollTop;
    // lineNumbersRef.value.scrollLeft = textareaRef.value.scrollLeft;
}
</script>

<template>
    <h1>Coding Editor</h1>
    <div class="wrapper">
        <div class="editor">
            <div class="line-numbers" ref="lineNumbersRef">
                <div
                    v-for="i in codeStore.code.split('\n').length"
                    class="line-number"
                >
                    {{ i }}
                </div>
            </div>
            <textarea
                v-model="codeStore.code"
                wrap="off"
                ref="textareaRef"
                @scroll="onScroll"
            ></textarea>
        </div>
        <div class="assembled-code">{{ codeStore.assembledCodeString }}</div>
    </div>
</template>

<style scoped>
.wrapper {
    margin: 0 1em 0 1em;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: stretch;
    /* height: 12em; */
    /* max-height: 12em; */
    gap: 1em;
    line-height: 1em;
    /* overflow: auto; */
    padding: 1em;
}
.editor {
    outline: 1px solid black;
    display: flex;
    flex-direction: row;
    font-family: 'Courier New', monospace;
    gap: 10px;
}
.editor > textarea {
    flex: 1;
    outline: none;
    border: none;
    resize: none;
    padding: 0;
    margin: 0;
    line-height: inherit;
}
.line-numbers {
    background: #282a3a;
    color: lightgrey;
    box-sizing: border-box;
}
.line-number {
    width: 2em;
    text-align: right;
}
.assembled-code {
    outline: 1px solid black;
    white-space: pre;
    font-family: 'Courier New', monospace;
}
</style>
