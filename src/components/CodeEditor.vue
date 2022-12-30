<script setup lang="ts">
import { ref } from 'vue'
</script>

<template>
    <h1>Coding Editor</h1>
    <div class="editor" contenteditable="true"></div>
</template>

<style scoped>
.editor {
    outline: 1px solid black;
    width: 300px;
    height: 300px;
    background-color: aqua;
}
</style>
