/**
 * Система метаданных для редактируемых свойств.
 * Позволяет декларативно описывать UI для свойств класса через декораторы.
 */
import type { BaseShape } from './base';

export interface PropertyDescriptor {
    key: string;
    label: string;
    type: 'number' | 'string' | 'color' | 'boolean' | 'select';
    readonly?: boolean;
    min?: number;
    max?: number;
    step?: number;
    hidden?: boolean;
    options?: { label: string; value: unknown }[];
}

/**
 * Декоратор свойства. Регистрирует метаданные для генерации UI.
 */
export function Editable(descriptor: Omit<PropertyDescriptor, 'key'>) {
    return function (target: unknown, propertyKey: string | symbol) {
        const targetObj = target as Record<string, unknown>;

        if (
            !Object.prototype.hasOwnProperty.call(
                targetObj,
                '_editableProperties'
            )
        ) {
            targetObj._editableProperties = [];
        }

        const key = String(propertyKey);
        const props = targetObj._editableProperties as PropertyDescriptor[];

        const existingIndex = props.findIndex((p) => p.key === key);
        if (existingIndex >= 0) {
            props[existingIndex] = { key, ...descriptor };
        } else {
            props.push({ key, ...descriptor });
        }
    };
}

/**
 * Декоратор класса. Скрывает указанные свойства (включая унаследованные).
 */
export function HideProperties<T extends typeof BaseShape>(keys: string[]) {
    return function (constructor: T): T {
        (
            constructor.prototype as unknown as Record<string, unknown>
        )._hiddenProperties = new Set(keys);
        return constructor;
    };
}

/**
 * Собирает дескрипторы свойств для генерации панели управления.
 * Проходит по цепочке прототипов и учитывает скрытые свойства.
 */
export function getEditableProperties(shape: object): PropertyDescriptor[] {
    const descriptorMap = new Map<string, PropertyDescriptor>();
    let currentProto = Object.getPrototypeOf(shape);

    while (currentProto && currentProto !== Object.prototype) {
        if (currentProto._editableProperties) {
            for (const desc of currentProto._editableProperties as PropertyDescriptor[]) {
                if (!descriptorMap.has(desc.key)) {
                    descriptorMap.set(desc.key, desc);
                }
            }
        }
        currentProto = Object.getPrototypeOf(currentProto);
    }

    const hiddenSet = (
        shape.constructor as { prototype: Record<string, unknown> }
    ).prototype._hiddenProperties as Set<string> | undefined;

    return Array.from(descriptorMap.values()).filter((desc) => {
        const isExplicitlyHidden = desc.hidden;
        const isHiddenByDecorator = hiddenSet?.has(desc.key);
        return !isExplicitlyHidden && !isHiddenByDecorator;
    });
}
