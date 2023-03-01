<script setup lang="ts">
import { useCodeStore } from '../stores/code';
import { useSettingsStore } from '../stores/settings';

const codeStore = useCodeStore();
const settingsStore = useSettingsStore();
</script>

<template>
    <h1>Coding Editor</h1>
    <div class="wrapper">
        <div class="editor">
            <div class="line-numbers">
                <div
                    v-for="(line, i) in codeStore.code.split('\n')"
                    :key="i"
                    class="line-number"
                >
                    <input
                        type="checkbox"
                        class="breakpoint"
                        v-model="line.breakpoints"
                    />
                    <span class="line-number-text">{{ i + 1 }}</span>
                </div>
            </div>
            <textarea
                v-model="codeStore.code"
                wrap="off"
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
    gap: 1em;
    line-height: 1em;
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
    display: flex;
    align-items: center;
    text-align: right;
    width: 3em;
    padding-left: 0.3em;
}

.breakpoint {
    margin: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    border-radius: 50%;
    background-color: #282a3a;
    
    /* Slightly smaller than the line */
    height: 0.8em;
    width: 0.8em;
}

.breakpoint:hover {
    background-color: #f09892;
}

.breakpoint:checked {
    background-color: #f44336;
}

.line-number-text {
    flex: 1;
    
    /* Not selectable: */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.assembled-code {
    outline: 1px solid black;
    white-space: pre;
    font-family: 'Courier New', monospace;
}
</style>
