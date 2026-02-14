<script setup lang="ts">
/**
 * Панель свойств выбранного объекта.
 * Показывает координаты, цвет и размеры.
 */
</script>

<template>
    <div class="properties-panel">
        <h3>Properties</h3>
        <div class="empty-state">No selection</div>
    </div>
</template>

<style scoped>
.properties-panel {
    padding: 1rem;
    background: #f0f0f0;
    border-left: 1px solid #ccc;
    min-width: 250px;
}
</style>
