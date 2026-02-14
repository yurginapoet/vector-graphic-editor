<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useCanvasStore } from '@/stores/canvas';
import { useCanvasRender } from '@/canvas/composables/useCanvasRender';

/**
 * Основной компонент холста.
 * Инициализирует canvas элемент и связывает его с рендерером.
 * Обрабатывает изменение размеров родительского контейнера.
 */

const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const canvasStore = useCanvasStore();
const { shapes } = storeToRefs(canvasStore);

// Подключаем логику рендера
const { draw } = useCanvasRender(canvasRef, shapes);

// Обновляем размеры canvas при ресайзе окна
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
    if (containerRef.value) {
        resizeObserver = new ResizeObserver((entries) => {
            // Синхронизируем размер canvas с размером контейнера
            // Это критично, чтобы не было "растянутых" пикселей
            const entry = entries[0];
            if (!entry) return;

            const { width, height } = entry.contentRect;
            if (canvasRef.value) {
                canvasRef.value.width = width;
                canvasRef.value.height = height;
                draw(); // Перерисовать после ресайза
            }
        });
        resizeObserver.observe(containerRef.value);
    }

    // Первая отрисовка
    draw();
});

onUnmounted(() => {
    resizeObserver?.disconnect();
});

// Реакция на изменение данных (пока для теста)
watchEffect(() => {
    if (shapes.value) draw();
});
</script>

<template>
    <div ref="containerRef" class="canvas-wrapper">
        <canvas ref="canvasRef" class="main-canvas"></canvas>
    </div>
</template>

<style scoped>
.canvas-wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #ffffff;
    position: relative;
}

.main-canvas {
    display: block;
    /* Курсор будет меняться в зависимости от инструмента */
    cursor: default;
}
</style>
