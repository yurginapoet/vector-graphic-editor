/**
 * Регистрация всех типов полей ввода.
 * Импорт активирует регистрацию в fieldRegistry.
 */
import './base/BaseField';
import './number/NumberField';
import './color/ColorField';

export { getField } from './registry';
