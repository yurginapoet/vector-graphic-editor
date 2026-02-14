import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Shape } from '@/canvas/types/shape';

/**
 * Основное хранилище состояния сцены.
 * Хранит список фигур и ID выбранной фигуры.
 * Используется Canvas для рендера и GUI для отображения свойств.
 */
export const useCanvasStore = defineStore('canvas', () => {
    // State
    const shapes = ref<Shape[]>([]);
    const selectedId = ref<string | null>(null);

    // Actions
    // Пока просто заглушки, чтобы компоненты могли их вызывать без ошибок
    function addShape(shape: Shape) {
        shapes.value.push(shape);
    }

    function selectShape(id: string | null) {
        selectedId.value = id;
    }

    return {
        shapes,
        selectedId,
        addShape,
        selectShape,
    };
});
