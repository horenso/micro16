<script setup lang="ts">
import { useCodeStore } from '../stores/code';
import { reactive, ref } from 'vue';
import { lex } from '../service/assembler/lexer';
import { Token } from '../service/assembler/token';

const codeStore = useCodeStore();

const textareaRef = ref<HTMLTextAreaElement>();
const codeOverlayRef = ref<HTMLPreElement>();

const tokenizedLines: Token[][] = [];

function onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    codeStore.code = target.value;
    const res = highlightCode(codeStore.code);
    (codeOverlayRef.value as HTMLPreElement).innerHTML = res;
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

function getSpan(className: string, text: string): string {
    return `<span class=${className}>${text}</span>`;
}

function highlightCode(code: string): string {
    let highlightedCode = '';
    console.log(codeStore.tokenizedLines)
    for (let line of codeStore.tokenizedLines) {
        for (let token of line) {
            switch (token.type) {
                case 'GOTO':
                case 'IF':
                case 'FUNCTION':
                case 'LOCATION':
                    highlightedCode += getSpan("keyword", token.text);
                    break;
                case 'ARROW':
                case 'UNARY_OPERATOR':
                case 'BINARY_OPERATOR':
                case 'L_PAREN':
                case 'R_PAREN':
                    highlightedCode += getSpan("punctuation", token.text);
                    break;
                case 'COMMENT':
                    highlightedCode += getSpan("comment", token.text);
                    break;
                case 'GARBAGE':
                    highlightedCode += getSpan("garbage", token.text);
                    break;
                case 'JUMP_ADDRESS':
                    highlightedCode += getSpan("number", token.text);
                    break;
                default:
                    highlightedCode += token.text;
                    break;
            }
        }
        highlightedCode += '\n';
    }
    return highlightedCode;
}
</script>

<template>
    <h1>Coding Editor</h1>
    <div class="wrapper">
        <div class="editor">
            <div class="line-numbers">
                <div v-for="(line, i) in codeStore.code.split('\n')" :key="i" class="line-number">
                    <input type="checkbox" class="breakpoint" />
                    <span class="line-number-text">{{ i + 1 }}</span>
                </div>
            </div>
            <div class="code-area">
                <textarea wrap="off" ref="textareaRef" spellcheck="false" class="code-textarea" :value="codeStore.code"
                    rows="10" @input="onInput" @keydown.tab.prevent="onTab" @scroll="onScroll"></textarea>
                <pre class="code-overlay" ref="codeOverlayRef"></pre>
            </div>
        </div>
        <div class="assembled-code">
            {{ codeStore.assembledCodeString }}
        </div>
    </div>
</template>

<!-- Syntax highlighting classes: -->
<style>
.keyword {
    color: rgb(86, 146, 129);
}

.punctuation {
    color: rgb(129, 88, 35);
}

.comment {
    color: grey;
}

.garbage {
    text-decoration: underline wavy 1px rgba(255, 0, 0, 0.342);
}

.number {
    color: rgb(57, 92, 0);
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

.code-textarea {
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
    caret-color: rgb(0, 0, 0);
}

.code-textarea::selection {
    color: transparent;
    background-color: rgba(91, 116, 255, 0.548);
}

.code-area>* {
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
    overflow-y: auto;
}

.assembled-code {
    outline: 1px solid black;
    white-space: pre;
    font-family: 'Courier New', monospace;
}
</style>
