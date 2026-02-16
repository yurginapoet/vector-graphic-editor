import { Editable } from './property';
import { getEditableProperties } from './property';

export interface Point {
    x: number;
    y: number;
}

export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

/**
 * Абстрактная фигура на холсте.
 */
export abstract class BaseShape {
    abstract readonly type: string;

    constructor(
        public id: string,
        public position: Point
    ) {}

    @Editable({ label: 'Позиция X', type: 'number' })
    get x(): number {
        return this.position.x;
    }
    set x(v: number) {
        this.position.x = v;
    }

    @Editable({ label: 'Позиция Y', type: 'number' })
    get y(): number {
        return this.position.y;
    }
    set y(v: number) {
        this.position.y = v;
    }

    @Editable({ label: 'Поворот', type: 'number', min: 0, max: 360 })
    rotation: number = 0;

    points?: Point[];

    abstract hitTest(point: Point): boolean;

    abstract getBoundingBox(): BoundingBox;

    abstract render(ctx: CanvasRenderingContext2D): void;

    abstract move(delta: Point): void;

    /**
     * Получает список редактируемых свойств для панели управления.
     */
    getProperties() {
        return getEditableProperties(this);
    }
}
