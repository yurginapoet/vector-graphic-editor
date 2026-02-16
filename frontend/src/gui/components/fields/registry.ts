import { Registry } from '@/utils/registry';
import type { BaseField } from './base/BaseField';

/**
 * Глобальный реестр полей ввода.
 * Поля регистрируют себя сами при загрузке.
 */
export const fieldRegistry = new Registry<BaseField>();

export function getField(type: string): BaseField | null {
    return fieldRegistry.get(type) ?? null;
}
