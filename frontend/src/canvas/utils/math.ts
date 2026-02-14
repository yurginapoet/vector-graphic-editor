/**
 * Генерирует уникальный идентификатор для фигуры.
 */
export function generateId(): string {
    return `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
