import { Registry } from '@/utils/registry';
import type { BaseShape, Point } from './base';

type ShapeConstructor = new (id: string, pos: Point) => BaseShape;

class ShapeRegistry extends Registry<ShapeConstructor> {
    create(type: string, id: string, pos: Point): BaseShape {
        const Ctor = this.get(type);
        if (!Ctor) throw new Error(`Тип фигуры "${type}" не найден`);
        return new Ctor(id, pos);
    }
}

export const shapeRegistry = new ShapeRegistry();
