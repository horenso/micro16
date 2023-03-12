<script setup lang="ts">
import { ref } from 'vue';
import { useCodeStore } from '@/stores/code';
import { useCpuStore } from '@/stores/cpu';
import { storeToRefs } from 'pinia';

const codeStore = useCodeStore();
const cpuStore = useCpuStore();

const textareaRef = ref<HTMLTextAreaElement>();
const codeOverlayRef = ref<HTMLPreElement>();

const { isActivated, MIC } = storeToRefs(cpuStore);

function isActiveLine(index: number): boolean {
    if (!isActivated.value || MIC.value > codeStore.assembledCode.length - 1) {
        return false;
    }
    return MIC.value === index;
}

function onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    codeStore.setCode(target.value);
}

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
    textarea.dispatchEvent(new Event('input'));
}

function onScroll() {
    const textarea = textareaRef.value as HTMLTextAreaElement;
    const overlay = codeOverlayRef.value as HTMLPreElement;
    overlay.scrollLeft = textarea.scrollLeft;
}
</script>

<template>
    <div class="wrapper">
        <div class="editor">
            <div class="line-numbers">
                <div
                    v-for="(line, i) in codeStore.code.split('\n')"
                    :key="i"
                    class="line-number"
                >
                    <input type="checkbox" class="breakpoint" />
                    <span
                        class="line-number-text"
                        :class="{
                            'line-number-selected': isActiveLine(i),
                        }"
                        >{{ i }}</span
                    >
                </div>
            </div>
            <div class="code-area">
                <textarea
                    wrap="off"
                    ref="textareaRef"
                    spellcheck="false"
                    class="code-textarea"
                    :value="codeStore.code"
                    rows="10"
                    @input="onInput"
                    @keydown.tab.prevent="onTab"
                    @scroll="onScroll"
                ></textarea>
                <pre
                    class="code-overlay"
                    ref="codeOverlayRef"
                    v-html="codeStore.codeOverlay"
                ></pre>
            </div>
        </div>
        <div class="assembled-code">
            <div
                v-for="(line, i) in codeStore.assembledCodeString.split('\n')"
                class="assembled-code-line"
                :class="{
                    'assembled-code-line-active': isActiveLine(i),
                }"
            >
                {{ line }}
            </div>
        </div>
    </div>
</template>

<!-- Syntax highlighting classes: -->
<style>
.active-line {
    background-color: #ff110041;
    display: block;
}

.assembled-code-line-active {
    background-color: #ff110041;
}

.keyword {
    color: #a72f2f;
}

.punctuation {
    color: #007b0d;
}

.comment {
    color: grey;
}

.label,
.number {
    color: #003eaa;
}

.garbage {
    text-decoration: underline wavy 1px rgba(255, 0, 0, 0.342);
}
</style>

<style scoped>
.wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-items: stretch;
    gap: 1em;
    padding: 1em;
    min-height: 10em;
}

.wrapper > * {
    font-family: 'Verdana,sans-serif', monospace;
    font-size: 1.5rem;
}

.editor {
    display: flex;
    outline: 1px solid;
    flex-direction: row;
    position: relative;
}

.line-numbers {
    background: #282a3a;
    color: lightgrey;
    box-sizing: border-box;
}

.line-number {
    display: flex;
    padding: 0 0.5em 0 0.5em;
    align-items: center;
}

.breakpoint {
    margin: 0;
    margin-right: 0.3em;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    border-radius: 50%;
    background-color: #282a3a;

    height: 1em;
    width: 1em;
}

.breakpoint:hover {
    background-color: #f09892;
}

.breakpoint:checked {
    background-color: #f44336;
}

.line-number-text {
    text-align: right;
    flex-grow: 1;

    /* Not selectable: */
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.line-number-selected {
    color: #f09892;
}

.code-area {
    flex-grow: 1;
    display: flex;
    position: relative;
}

.code-textarea {
    flex: 1;
    outline: none;
    border: none;
    resize: none;
    padding: 0;
    margin: 0;
    padding-left: 0.5em;
    height: 100%;
    color: transparent;
    font-size: inherit;
    background: transparent;
    caret-color: rgb(0, 0, 0);
}

.code-textarea::selection {
    color: transparent;
    background-color: #5b74ff8c;
}

.code-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding-left: 0.5em;
    box-sizing: border-box;
    pointer-events: none;
    overflow-y: auto;
}

.assembled-code {
    outline: 1px solid black;
    white-space: pre;
}
</style>
