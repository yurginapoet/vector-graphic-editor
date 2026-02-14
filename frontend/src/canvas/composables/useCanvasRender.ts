import type { Ref } from 'vue';
import type { Shape } from '@/canvas/types/shape';

/**
 * Отвечает за рендеринг фигур на HTML5 Canvas.
 * В будущем здесь будет requestAnimationFrame loop и offscreen buffer.
 */
export function useCanvasRender(
    canvasRef: Ref<HTMLCanvasElement | null>,
    shapes: Ref<Shape[]>
) {
    // Основной метод перерисовки
    // Вызывается при изменении размеров, зуме или изменении фигур
    function draw() {
        const canvas = canvasRef.value;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Очистка холста
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Временная заглушка для визуализации работы
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Canvas Ready for Rendering', 20, 40);
        ctx.fillText(`Shapes count: ${shapes.value.length}`, 20, 70);
    }

    return {
        draw,
    };
}
