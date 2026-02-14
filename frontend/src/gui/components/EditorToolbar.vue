<script setup lang="ts">
/**
 * Панель инструментов.
 * Содержит кнопки добавления фигур и выбор инструментов.
 */
</script>

<template>
    <div class="toolbar">
        <h3>Tools</h3>
        <div class="button-group">
            <button>Select</button>
            <button>Rect</button>
            <button>Circle</button>
        </div>
    </div>
</template>

<style scoped>
.toolbar {
    padding: 1rem;
    background: #f0f0f0;
    border-right: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
</style>
