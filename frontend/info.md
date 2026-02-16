# FULLY AI GENERATED / NOT REVIEWED

Этот документ представляет собой пошаговый, детальный разбор архитектуры приложения сверху вниз. Мы начнём с общей структуры проекта, затем разберём корневой компонент, модули по порядку (stores, canvas/types, canvas/composables, canvas/components, gui/components, utils), и закончим описанием ключевых взаимодействий и потоков данных. Разбор ориентирован на то, чтобы разработчик мог полностью понять, как приложение работает, только на основе этого описания (с опорой на предоставленный код). Я опишу ключевые фрагменты кода, логику, зависимости и потенциальные точки расширения. Не буду экономить на деталях — каждый модуль разобран с примерами.

## 1. Общая структура проекта и запуск

Приложение — это Vue 3 проект с TypeScript, использующий Vite как сборщик (предполагается по стандартным командам `npm run dev`). Корневая директория: `frontend/` (в контексте большего репозитория).

### Структура директорий
```
frontend/
├── src/
│   ├── App.vue              # Корневой компонент (layout)
│   ├── main.ts              # Точка входа (создание app, Pinia)
│   ├── canvas/              # Всё связанное с холстом и фигурами
│   │   ├── components/      # Компоненты холста (VectorCanvas.vue)
│   │   ├── composables/     # Composable-функции (useCanvasRender, useInteractions)
│   │   ├── types/           # Классы фигур, типы, декораторы (BaseShape, CircleShape и т.д.)
│   │   └── utils/           # Утилиты (math.ts для generateId)
│   ├── gui/                 # Интерфейсные компоненты
│   │   └── components/      # Toolbar, PropertiesPanel, fields/ (система полей ввода)
│   ├── stores/              # Pinia stores (canvas.ts, tools.ts)
│   └── utils/               # Общие утилиты (registry.ts)
└── ... (vite.config.ts, public/, etc.)
```

### Точка входа: src/main.ts
Это файл, где приложение инициализируется:
```ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.mount('#app');
```
- Создаёт Vue-приложение на базе App.vue.
- Подключает Pinia для state management.
- Монтирует в DOM-элемент `#app`.

При запуске (`npm run dev`) Vite запускает dev-сервер, компилирует TS в JS, и приложение доступно на localhost.

## 2. Корневой компонент: src/App.vue

Это основной layout приложения. Он определяет структуру UI с помощью CSS Grid.

### Script setup
```ts
import Toolbar from './gui/components/EditorToolbar.vue';
import PropertiesPanel from './gui/components/PropertiesPanel.vue';
import Canvas from './canvas/components/VectorCanvas.vue';
```
- Импортирует три ключевых компонента: Toolbar (левая панель), Canvas (центр), PropertiesPanel (правая панель).

### Template
```html
<div class="app-layout">
    <header class="header">Vector Editor (MVP)</header>
    <aside class="left-panel"><Toolbar /></aside>
    <main class="viewport"><Canvas /></main>
    <aside class="right-panel"><PropertiesPanel /></aside>
</div>
```
- Grid-структура: header сверху, затем toolbar | viewport | properties.
- Grid-template: rows — 40px (header) + 1fr (основное); columns — 60px (toolbar) + 1fr (canvas) + 280px (properties).

### Styles
- Глобальные: Устанавливают full-screen для html/body/#app.
- Scoped: Определяют цвета, бордеры, позиционирование.

**Как работает**: App.vue — это статичный контейнер. Он не имеет логики, только размещает подкомпоненты. Реактивность обеспечивается через stores (Pinia), которые шарингятся между Toolbar, Canvas и PropertiesPanel.

## 3. Хранилища состояния: src/stores/

Pinia stores — центральное место для глобального состояния. Они реактивны (Vue refs/computed) и используются в компонентах через `storeToRefs`.

### canvas.ts: Хранилище фигур и выделения
```ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Shape } from '@/canvas/types';
import { shapeRegistry } from '@/canvas/types';
import { generateId } from '@/canvas/utils/math';

export const useCanvasStore = defineStore('canvas', () => {
    const shapes = ref<Shape[]>([]);
    const selectedId = ref<string | null>(null);

    const selectedShape = computed(() => shapes.value.find(s => s.id === selectedId.value) ?? null);

    function addShape(type: string, pos: { x: number; y: number }) {
        const shape = shapeRegistry.create(type, generateId(), pos);
        shapes.value.push(shape);
        return shape;
    }

    function updateShape(id: string, updates: Partial<Shape>) {
        const shape = shapes.value.find(s => s.id === id);
        if (shape) {
            Object.assign(shape, updates);
            shapes.value = [...shapes.value];  // Force reactivity
        }
    }

    function deleteShape(id: string) {
        shapes.value = shapes.value.filter(s => s.id !== id);
        if (selectedId.value === id) selectedId.value = null;
    }

    function selectShape(id: string | null) {
        selectedId.value = id;
    }

    return { shapes, selectedId, selectedShape, addShape, updateShape, deleteShape, selectShape };
});
```
- **Состояние**: `shapes` — массив экземпляров Shape (реактивный ref). `selectedId` — ID выделенной фигуры.
- **Computed**: `selectedShape` — находит фигуру по ID.
- **Методы**:
  - `addShape`: Создаёт фигуру через registry (с дефолтными параметрами, кроме позиции), добавляет в массив.
  - `updateShape`: Находит фигуру, применяет updates через Object.assign, форсирует реактивность копированием массива (Vue-хакинг для мутации объектов в массиве).
  - `deleteShape`: Удаляет по ID, очищает выделение если нужно.
  - `selectShape`: Устанавливает ID.

**Зависимости**: Импортирует Shape из types, registry и generateId из canvas/.

### tools.ts: Хранилище инструментов
```ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToolType = 'select' | 'rect' | 'circle' | 'line';

export const useToolsStore = defineStore('tools', () => {
    const activeTool = ref<ToolType>('select');

    function setActiveTool(tool: ToolType) {
        activeTool.value = tool;
    }

    return { activeTool, setActiveTool };
});
```
- **Состояние**: `activeTool` — текущий инструмент (по умолчанию 'select').
- **Метод**: `setActiveTool` — переключает инструмент.

**Как работают stores**: Компоненты импортируют `useCanvasStore()` или `useToolsStore()`, затем используют `storeToRefs` для реактивных ссылок (например, `{ shapes, selectedId } = storeToRefs(canvasStore)`). Изменения в store автоматически обновляют UI.

## 4. Модель данных: src/canvas/types/

Это доменная модель — классы фигур с ООП, декораторами и registry. Фигуры — это объекты с методами для рендеринга, hit-теста и перемещения.

### base.ts: Базовый класс и типы
```ts
export interface Point { x: number; y: number; }
export interface BoundingBox { minX: number; minY: number; maxX: number; maxY: number; }

export abstract class BaseShape {
    abstract readonly type: string;

    constructor(public id: string, public position: Point) {}

    @Editable({ label: 'Позиция X', type: 'number' }) get x(): number { return this.position.x; } set x(v: number) { this.position.x = v; }
    @Editable({ label: 'Позиция Y', type: 'number' }) get y(): number { return this.position.y; } set y(v: number) { this.position.y = v; }

    @Editable({ label: 'Поворот', type: 'number', min: 0, max: 360 }) rotation: number = 0;

    points?: Point[];

    abstract hitTest(point: Point): boolean;
    abstract getBoundingBox(): BoundingBox;
    abstract render(ctx: CanvasRenderingContext2D): void;
    abstract move(delta: Point): void;

    getProperties() { return getEditableProperties(this); }
}
```
- **Интерфейсы**: Point (координаты), BoundingBox (границы).
- **BaseShape**: Абстрактный класс с id, position (Point), rotation. Геттеры/сеттеры для x/y с @Editable.
- **Методы**: Абстрактные для hitTest (попадание точки), getBoundingBox, render (отрисовка на ctx), move (смещение).
- **getProperties**: Вызывает getEditableProperties для списка редактируемых свойств.

### property.ts: Система метаданных свойств
```ts
export interface PropertyDescriptor { key: string; label: string; type: 'number' | 'string' | 'color' | 'boolean' | 'select'; /* ... */ }

export function Editable(descriptor: Omit<PropertyDescriptor, 'key'>) {
    return function (target: unknown, propertyKey: string | symbol) {
        // Регистрирует в target._editableProperties
    };
}

export function HideProperties<T extends typeof BaseShape>(keys: string[]) {
    return function (constructor: T): T {
        (constructor.prototype as any)._hiddenProperties = new Set(keys);
        return constructor;
    };
}

export function getEditableProperties(shape: object): PropertyDescriptor[] {
    // Собирает из цепочки прототипов, фильтрует hidden
}
```
- **@Editable**: Декоратор, добавляет метаданные в _editableProperties прототипа.
- **@HideProperties**: Декоратор класса, устанавливает _hiddenProperties как Set.
- **getEditableProperties**: Проходит по прототипам, собирает дескрипторы, исключает hidden.

Это позволяет динамически генерировать UI для свойств без хардкода.

### registry.ts: Реестр фигур
```ts
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
```
- **Registry**: Базовый класс из utils/ (Map с register/get).
- **ShapeRegistry**: Расширяет, добавляет create (new Ctor с id и pos).
- Используется в store.addShape.

### Конкретные фигуры (circle.ts, rect.ts, line.ts)
Каждый файл определяет класс, наследующий BaseShape, с @Editable для свойств, и регистрирует в shapeRegistry.

- **CircleShape**:
  - Свойства: radiusX/Y, fill, stroke, strokeWidth.
  - hitTest: Проверяет эллиптическое расстояние с padding.
  - getBoundingBox: min/max от центра - radius.
  - render: ctx.ellipse + fill + stroke.
  - move: Смещает position.

- **RectShape**:
  - Свойства: width, height, fill, stroke, strokeWidth.
  - hitTest: Проверяет вхождение в bbox.
  - getBoundingBox: min/max от центра - half size.
  - render: ctx.fillRect + strokeRect.
  - move: Смещает position.

- **LineShape** (@HideProperties(['x', 'y'])):
  - Свойства: stroke, strokeWidth, startX/Y (алиас position), endX/Y (из points[0]).
  - hitTest: Проекция точки на линию, расстояние <= padding.
  - getBoundingBox: min/max от start/end с padding.
  - render: ctx.moveTo + lineTo + stroke.
  - move: Смещает position и points[0].

**Регистрация**: В конце каждого файла `shapeRegistry.register('type', Class)`.

**Расширение**: Чтобы добавить новую фигуру (например, Triangle), создайте класс, реализуйте абстрактные методы, добавьте @Editable, зарегистрируйте.

## 5. Composable-функции: src/canvas/composables/

Composable — это Vue 3 паттерн для переиспользуемой логики.

### useCanvasRender.ts: Отрисовка
```ts
export function useCanvasRender(canvasRef: Ref<HTMLCanvasElement | null>, shapes: Ref<Shape[]>, selectedId: Ref<string | null>) {
    function drawSelectionBox(ctx: CanvasRenderingContext2D, shape: Shape) { /* dashed rect */ }

    function draw() {
        const ctx = canvasRef.value?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const shape of shapes.value) {
            shape.render(ctx);
            if (shape.id === selectedId.value) drawSelectionBox(ctx, shape);
        }
    }

    return { draw };
}
```
- Принимает refs: canvas, shapes, selectedId.
- draw: Очищает, вызывает shape.render для каждой, добавляет box для selected.
- **Использование**: В VectorCanvas.vue, watch([shapes, selectedId], draw, {deep: true}).

### useInteractions.ts: Взаимодействия
```ts
export function useInteractions(canvasRef: Ref<HTMLCanvasElement | null>, shapes: Ref<Shape[]>) {
    const isDragging = ref(false);
    const dragStart = ref<Point>({ x: 0, y: 0 });
    const activeShape = ref<Shape | null>(null);

    function getLocalPoint(e: MouseEvent): Point { /* clientX - rect.left */ }

    function hitTest(point: Point): Shape | null {
        for (let i = shapes.value.length - 1; i >= 0; i--) {  // Top-down
            if (shapes.value[i].hitTest(point)) return shapes.value[i];
        }
        return null;
    }

    function onMouseDown(e: MouseEvent) {
        const point = getLocalPoint(e);
        const shape = hitTest(point);
        canvasStore.selectShape(shape?.id ?? null);
        if (shape) { isDragging.value = true; activeShape.value = shape; dragStart.value = point; }
    }

    function onMouseMove(e: MouseEvent) {
        const point = getLocalPoint(e);
        if (isDragging.value && activeShape.value) {
            const dx = point.x - dragStart.value.x; const dy = point.y - dragStart.value.y;
            activeShape.value.move({ x: dx, y: dy });
            dragStart.value = point;
            canvas.style.cursor = 'grabbing';
        } else {
            const hover = hitTest(point);
            canvas.style.cursor = hover ? 'grab' : 'default';
        }
    }

    function onMouseUp() { isDragging.value = false; activeShape.value = null; canvas.style.cursor = 'default'; }

    function attachListeners() {
        const el = canvasRef.value;
        if (!el) return;
        el.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => { /* remove listeners */ };
    }

    return { attachListeners };
}
```
- Refs: isDragging, dragStart, activeShape.
- hitTest: Проверяет фигуры сверху вниз.
- События: mousedown — hit + select + start drag; mousemove — drag или cursor; mouseup — end drag.
- attachListeners: Добавляет/возвращает отписчик.
- **Зависимости**: Использует canvasStore.selectShape.

## 6. Компонент холста: src/canvas/components/VectorCanvas.vue

Это основной компонент для <canvas>.

### Script setup
```ts
const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

const canvasStore = useCanvasStore();
const { shapes, selectedId } = storeToRefs(canvasStore);

const { draw } = useCanvasRender(canvasRef, shapes, selectedId);
const { attachListeners } = useInteractions(canvasRef, shapes);

let resizeObserver: ResizeObserver | null = null;
let detachListeners: (() => void) | undefined;

const updateCanvasSize = () => { /* set width/height = container.client, then draw */ };

onMounted(() => {
    if (containerRef.value) {
        resizeObserver = new ResizeObserver(updateCanvasSize);
        resizeObserver.observe(containerRef.value);
    }
    detachListeners = attachListeners();
});

onUnmounted(() => { resizeObserver?.disconnect(); detachListeners?.(); });

watch([shapes, selectedId], () => requestAnimationFrame(draw), { deep: true });
```
- Refs: container (wrapper), canvas.
- Store: shapes, selectedId.
- Composable: draw из useCanvasRender, attachListeners из useInteractions.
- ResizeObserver: Адаптирует canvas под контейнер, вызывает draw.
- Lifecycle: onMounted — observe + attach; onUnmounted — disconnect.
- Watch: Глубоко следит за shapes/selectedId, вызывает draw в RAF.

### Template
```html
<div ref="containerRef" class="canvas-wrapper">
    <canvas ref="canvasRef" class="main-canvas"></canvas>
</div>
```
- Wrapper с overflow: hidden; canvas full-size.

**Как работает**: Компонент монтирует canvas, адаптирует размер, прикрепляет мышь-события, перерисовывает при изменениях.

## 7. Интерфейс: src/gui/components/

### EditorToolbar.vue: Панель инструментов
```ts
const toolsStore = useToolsStore();
const canvasStore = useCanvasStore();
const { activeTool } = storeToRefs(toolsStore);

const tools: ToolConfig[] = [ /* select, rect, circle, line с icon/title/action */ ];

function handleToolClick(tool: ToolConfig) { if (tool.action) tool.action(); else toolsStore.setActiveTool(tool.id); }

function addShape(type: ShapeType) {
    canvasStore.addShape(type, { x: 400, y: 300 });
    toolsStore.setActiveTool('select');
}
```
- Tools массив: Для 'select' — setActiveTool; для фигур — addShape + select.
- Template: Кнопки с class active если activeTool === id.
- **Логика**: Клик на фигуру добавляет в центр, переключает на select.

### PropertiesPanel.vue: Панель свойств
```ts
const canvasStore = useCanvasStore();
const { selectedShape } = storeToRefs(canvasStore);

const properties = computed(() => selectedShape.value ? getEditableProperties(selectedShape.value) : []);

function deleteSelected() { if (selectedShape.value) canvasStore.deleteShape(selectedShape.value.id); }

function updateProperty(key: string, value: unknown) {
    if (!selectedShape.value) return;
    canvasStore.updateShape(selectedShape.value.id, { [key]: value } as Partial<Shape>);
}
```
- Computed: properties из getEditableProperties.
- Template: Если selected, показывает ID (readonly), поля через FieldComponent, кнопку delete.
- Update: Вызывает store.updateShape с {key: value}.

### fields/: Система полей ввода
- **base/BaseField.ts**: Абстрактный класс с type, renderComponent, coerce, validate, format.
- **registry.ts**: fieldRegistry (Registry<BaseField>).
- **FieldComponent.vue**: Computed field = getField(type) || 'string'; рендерит FieldRenderer.
- **FieldRenderer.vue**: Динамически рендерит field.renderComponent.
- **number/NumberField.ts**: Наследует BaseField, coerce to number, validate min/max, render NumberInput.vue (<input type="number">).
- **color/ColorField.ts**: Аналогично, coerce to #RRGGBB, render ColorInput.vue (<input type="color">).

**Регистрация**: В файлах fieldRegistry.register('type', new Field()).
**Расширение**: Для нового типа (например, 'boolean') — создайте Field класс, Vue-компонент, зарегистрируйте.

## 8. Утилиты: src/utils/registry.ts и src/canvas/utils/math.ts

- **registry.ts**: Универсальный Map с register/get/getAll. Используется для shapeRegistry и fieldRegistry.
- **math.ts**: generateId() — 'shape_timestamp_random'.

## 9. Ключевые взаимодействия и потоки данных

### Создание фигуры
1. Toolbar: Клик на 'rect' → addShape('rect', {400,300}) → canvasStore.addShape → shapeRegistry.create → new RectShape(id, pos) → push в shapes.
2. Watch в Canvas: Обнаруживает изменение shapes → draw().
3. Tools: setActiveTool('select').

### Выделение и drag
1. Interactions: mousedown → hitTest (top-down) → selectShape(id) если hit.
2. Если shape, start drag: isDragging=true, activeShape=shape.
3. mousemove: Если dragging, вычислить delta → shape.move(delta) → обновление position (реактивно через store? Нет, прямое, но watch deep=true перерисует).
4. mouseup: end drag.

### Редактирование свойств
1. PropertiesPanel: selectedShape → getEditableProperties → список prop.
2. FieldComponent: Рендерит input по type, on input → updateProperty(key, value) → canvasStore.updateShape(id, {key:value}) → Object.assign → shapes=[...shapes] → watch → draw().

### Перерисовка
- При любом изменении shapes/selectedId (add/update/delete/select/move) — watch вызывает draw.
- Resize: Observer → updateCanvasSize → draw.

### Расширение приложения
- Новая фигура: Класс + register + добавить в Toolbar.tools.
- Новое свойство: @Editable в классе.
- Новый инструмент: В tools.ts ToolType + в Toolbar.
- Новый тип поля: Field класс + Vue input + register.
