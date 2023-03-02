<script setup lang="ts">
import { useCodeStore } from '../stores/code';
import { ref } from 'vue';
import { isLocation } from '../service/registers';

const codeStore = useCodeStore();

const textareaRef = ref<HTMLTextAreaElement>();
const codeOverlayRef = ref<HTMLPreElement>();

function onTab() {
    if (textareaRef.value === undefined) {
        return;
    }
    const textarea = textareaRef.value;
    const text = textarea.value;
    const before = text.slice(0, textarea.selectionStart);
    const after = text.slice(textarea.selectionEnd, text.length);
    const cursor = textarea.selectionEnd + 2;

    textarea.value = before + '  ' + after;
    textarea.selectionStart = cursor;
    textarea.selectionEnd = cursor;
    // Act as if the user inserted the spaces.
    const event = new Event('input');
    textarea.dispatchEvent(event);
}

codeStore.$subscribe(() => {
    if (codeOverlayRef.value === undefined) {
        return;
    }
    const res = highlightCode(codeStore.code);
    console.log(res);
    codeOverlayRef.value.innerHTML = res;
});

function highlightCode(code: string): string {
    const lines = code.split('\n');
    let highlightedCode = '';
    for (let i = 0; i < lines.length; i++) {
        const words = lines[i].split(' ');
        for (let j = 0; j < words.length; j++) {
            if (isKeyword(words[j])) {
                highlightedCode +=
                    "<span class='keyword'>" + words[j] + '</span>';
            } else {
                highlightedCode += words[j];
            }
            if (j < words.length - 1) {
                highlightedCode += ' ';
            }
        }
        if (i < lines.length - 1) {
            highlightedCode += '\n';
        }
    }
    return highlightedCode;
}

function isKeyword(word: string): boolean {
    const a = isLocation(word) || word === 'lsh' || word === 'rsh';
    console.log(word, a);
    return a;
}
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
                    <input type="checkbox" class="breakpoint" />
                    <span class="line-number-text">{{ i + 1 }}</span>
                </div>
            </div>
            <div class="code-area">
                <textarea
                    v-model="codeStore.code"
                    wrap="off"
                    ref="textareaRef"
                    spellcheck="false"
                    @keydown.tab.prevent="onTab"
                ></textarea>
                <pre class="code-overlay" ref="codeOverlayRef"></pre>
            </div>
        </div>
        <div class="assembled-code">{{ codeStore.assembledCodeString }}</div>
    </div>
</template>

<style>
.keyword {
    color: rgb(15, 177, 0);
}
</style>

<style scoped>
.wrapper {
    margin: 0 1em 0 1em;
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: stretch;
    gap: 1em;
    line-height: 1em;
    padding: 1em;
    min-height: 10em;
}

.editor {
    outline: 1px solid black;
    display: flex;
    flex-direction: row;
    font-family: 'Courier New', monospace;
    gap: 10px;
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

.code-area {
    flex-grow: 1;
    display: flex;
    position: relative;
}

.code-area > textarea {
    flex: 1;
    outline: none;
    border: none;
    resize: none;
    padding: 0;
    margin: 0;
    line-height: inherit;
    height: 100%;
    color: transparent;
    background: transparent;
    caret-color: red;
}

.code-area > * {
    line-height: inherit;
}

.code-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    box-sizing: border-box;
    pointer-events: none;
}

.assembled-code {
    outline: 1px solid black;
    white-space: pre;
    font-family: 'Courier New', monospace;
}
</style>
