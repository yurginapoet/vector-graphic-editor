/**
 * Базовые определения типов для графических примитивов.
 * Используются и в Canvas (рендер), и в Store (состояние), и в GUI (свойства).
 */

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'bezier';

export interface Point {
    x: number;
    y: number;
}

// Базовый интерфейс фигуры.
// В будущем расширим через Union Types (Rectangle | Circle...),
// но пока достаточно общего интерфейса для старта.
export interface Shape {
    id: string;
    type: ShapeType;
    x: number;
    y: number;
    rotation: number; // в радианах

    // Стилизация (упрощенно для старта)
    fillColor?: string;
    strokeColor: string;
    strokeWidth: number;
}

// В будущем здесь появятся интерфейсы для Handle и Viewport
