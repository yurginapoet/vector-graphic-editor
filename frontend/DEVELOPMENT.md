# DEVELOPMENT.md

Руководство для разработчиков по структуре и соглашениям проекта.

## 📋 Содержание

1. [Структура Модулей](#структура-модулей)
2. [Pinia Stores](#pinia-stores)
3. [Composables](#composables)
4. [Компоненты](#компоненты)
5. [Типы и Интерфейсы](#типы-и-интерфейсы)
6. [Git Workflow](#git-workflow)
7. [Code Style](#code-style)

---

## Структура Модулей

### Canvas Module (`src/canvas/`)

Отвечает за рендеринг и низкоуровневые взаимодействия с пользователем.

```
canvas/
├── components/
│   └── VectorCanvas.vue        # Главный компонент с <canvas> тегом
├── composables/
│   ├── useCanvasRender.ts      # Draw логика
│   ├── useInteractions.ts      # Mouse events (select, drag)
│   └── useShapes.ts            # Shape management (add, update, delete)
├── types/
│   └── shape.ts                # Shape interfaces
└── utils/
    └── math.ts                 # Math utilities (bounding box, hitTest)
```

**Ответственность:**

- Рендеринг фигур на canvas
- Определение, какую фигуру кликнул пользователь
- Обновление позиции фигур при drag
- Экспорт API для GUI модуля

**Зависимости:**

- `src/stores/canvas.ts` (читает и обновляет состояние фигур)

---

### GUI Module (`src/gui/`)

Отвечает за интерфейс пользователя.

```
gui/
├── components/
│   ├── EditorToolbar.vue       # Кнопки инструментов
│   └── PropertiesPanel.vue     # Форма для редактирования свойств
└── composables/
    └── useTools.ts             # Tool selection logic
```

**Ответственность:**

- Отображение Toolbar с кнопками
- Отображение Properties Panel
- Обработка выбора инструмента
- Обработка ввода пользователя (свойства фигур)

**Зависимости:**

- `src/stores/canvas.ts` (читает selectedShape, обновляет props)
- `src/stores/tools.ts` (читает и обновляет activeTool)

---

### Stores (`src/stores/`)

Централизованное состояние приложения (Pinia).

```
stores/
├── canvas.ts        # CanvasStore: фигуры, выделение, viewport
└── tools.ts         # ToolsStore: активный инструмент
```

#### `canvas.ts`

```typescript
interface CanvasState {
    shapes: Shape[];
    selectedId: string | null;
    viewport: Viewport;
    lastShapeId: number;
}
```

**Actions:**

- `addShape(type, position)` — добавить новую фигуру
- `updateShape(id, updates)` — обновить свойства фигуры
- `deleteShape(id)` — удалить фигуру
- `selectShape(id)` — выбрать фигуру
- `updateViewport(viewport)` — обновить размер canvas

**Getters:**

- `selectedShape` — получить выбранную фигуру
- `shapeCount` — количество фигур

#### `tools.ts`

```typescript
interface ToolsState {
    activeTool: ToolType;
}
```

**Actions:**

- `setActiveTool(tool)` — установить активный инструмент

---

## Pinia Stores

### Как Использовать Store в Компонентах

```typescript
<script setup lang="ts">
import { useCanvasStore } from '@/stores/canvas'

const canvasStore = useCanvasStore()

// Читать состояние (reactive)
const shapes = computed(() => canvasStore.shapes)
const selected = computed(() => canvasStore.selectedShape)

// Вызывать actions
function addCircle() {
  canvasStore.addShape('circle', { x: 100, y: 100 })
}
</script>
```

### Как Создать Новый Store

1. Создайте файл `src/stores/yourstore.ts`
2. Используйте `defineStore`:

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useYourStore = defineStore('your', () => {
    // State
    const state = ref({});

    // Actions
    const doSomething = () => {
        // изменения
    };

    // Getters
    const computed1 = computed(() => state.value.something);

    return {
        state,
        doSomething,
        computed1,
    };
});
```

3. Импортируйте и используйте в компонентах

---

## Composables

Composables — это переиспользуемые функции для логики.

### Структура Composable

```typescript
export function useMyComposable() {
    // Состояние (если нужно)
    const count = ref(0);

    // Методы
    const increment = () => count.value++;

    // Lifecycle hooks (если нужны)
    onMounted(() => {
        // ...
    });

    // Возвращаем API
    return {
        count: readonly(count),
        increment,
    };
}
```

### Используемые Composables в Проекте

#### `useCanvasRender`

Логика рендеринга фигур на canvas.

```typescript
const { draw } = useCanvasRender();

watch(
    () => canvasStore.shapes,
    () => {
        const ctx = canvasRef.value?.getContext('2d');
        if (ctx) {
            draw(ctx, canvasStore.shapes, canvasStore.selectedId);
        }
    }
);
```

#### `useInteractions`

Обработка мыши (выбор, drag).

```typescript
const { selectShapeAtPoint, startDrag, updateDrag, endDrag } =
    useInteractions();

function onMouseDown(event: MouseEvent) {
    const rect = canvasRef.value?.getBoundingClientRect();
    if (!rect) return;

    const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };

    selectShapeAtPoint(point);
    startDrag(point);
}
```

#### `useShapes`

Управление фигурами (добавление, удаление, обновление).

```typescript
const { addShape, deleteSelectedShape, updateSelectedShapeProps } = useShapes();

// Добавить круг
addShape('circle', { x: 100, y: 100 });

// Удалить выбранную
deleteSelectedShape();

// Обновить цвет
updateSelectedShapeProps({ props: { fill: '#ff0000' } });
```

#### `useTools`

Управление инструментами.

```typescript
const { selectTool, getActiveTool, addShapeWithTool } = useTools();

// Выбрать инструмент
selectTool('circle');

// Получить текущий инструмент
const active = getActiveTool(); // 'circle'

// Добавить фигуру текущего инструмента
addShapeWithTool({ x: 50, y: 50 });
```

---

## Компоненты

### VectorCanvas.vue

Главный компонент холста.

```typescript
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { useCanvasRender } from '@/canvas/composables/useCanvasRender'
import { useInteractions } from '@/canvas/composables/useInteractions'

const canvasRef = ref<HTMLCanvasElement>()
const canvasStore = useCanvasStore()
const { draw } = useCanvasRender()
const { selectShapeAtPoint, startDrag, updateDrag, endDrag } = useInteractions()

const isDragging = ref(false)
const dragStart = ref<{ x: number; y: number } | null>(null)

onMounted(() => {
  // Инициализация
})

watch(() => canvasStore.shapes, () => {
  redraw()
}, { deep: true })

const redraw = () => {
  const ctx = canvasRef.value?.getContext('2d')
  if (ctx) {
    draw(ctx, canvasStore.shapes, canvasStore.selectedId)
  }
}

const onMouseDown = (event: MouseEvent) => {
  // ...
}

const onMouseMove = (event: MouseEvent) => {
  // ...
}

const onMouseUp = (event: MouseEvent) => {
  // ...
}
</script>

<template>
  <canvas
    ref="canvasRef"
    class="vector-canvas"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  />
</template>

<style scoped>
.vector-canvas {
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #ccc;
  cursor: default;
  display: block;
}

.vector-canvas.dragging {
  cursor: move;
}
</style>
```

### EditorToolbar.vue

Панель инструментов.

```typescript
<script setup lang="ts">
import { useToolsStore } from '@/stores/tools'
import { useTools } from '@/gui/composables/useTools'

const toolsStore = useToolsStore()
const { selectTool } = useTools()

const tools = [
  { id: 'select', label: 'Select' },
  { id: 'circle', label: 'Add Circle' },
  { id: 'rect', label: 'Add Rect' },
  { id: 'line', label: 'Add Line' },
  { id: 'bezier', label: 'Add Bezier' }
]

const onSelectTool = (toolId: string) => {
  selectTool(toolId)
}
</script>

<template>
  <div class="toolbar">
    <button
      v-for="tool in tools"
      :key="tool.id"
      :class="{ active: toolsStore.activeTool === tool.id }"
      @click="onSelectTool(tool.id)"
    >
      {{ tool.label }}
    </button>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #f0f0f0;
}

button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
```

### PropertiesPanel.vue

Панель свойств фигур.

```typescript
<script setup lang="ts">
import { computed } from 'vue'
import { useCanvasStore } from '@/stores/canvas'
import { useShapes } from '@/canvas/composables/useShapes'

const canvasStore = useCanvasStore()
const { updateSelectedShapeProps } = useShapes()

const selectedShape = computed(() => canvasStore.selectedShape)

const updateColor = (color: string) => {
  if (!selectedShape.value) return
  updateSelectedShapeProps({
    props: { ...selectedShape.value.props, fill: color }
  })
}

const updateStrokeWidth = (width: number) => {
  if (!selectedShape.value) return
  updateSelectedShapeProps({
    props: { ...selectedShape.value.props, strokeWidth: width }
  })
}
</script>

<template>
  <div class="properties-panel">
    <h3>Properties</h3>
    <template v-if="selectedShape">
      <div class="property">
        <label>Color</label>
        <input
          type="color"
          :value="selectedShape.props.fill"
          @input="updateColor($event.target.value)"
        />
      </div>
      <div class="property">
        <label>Stroke Width</label>
        <input
          type="number"
          :value="selectedShape.props.strokeWidth"
          min="0"
          max="10"
          @input="updateStrokeWidth(Number($event.target.value))"
        />
      </div>
    </template>
    <div v-else class="empty">No shape selected</div>
  </div>
</template>

<style scoped>
.properties-panel {
  width: 300px;
  padding: 16px;
  border-left: 1px solid #ddd;
  background: #fafafa;
}

h3 {
  margin: 0 0 16px;
  font-size: 16px;
}

.property {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

input {
  padding: 6px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.empty {
  color: #999;
  font-style: italic;
}
</style>
```

---

## Типы и Интерфейсы

Все типы находятся в `src/canvas/types/shape.ts`.

```typescript
// Типы инструментов
export type ToolType = 'select' | 'circle' | 'rect' | 'line' | 'bezier';
export type ShapeType = 'circle' | 'rect' | 'line' | 'bezier';

// Базовый интерфейс Shape
export interface Shape {
    id: string;
    type: ShapeType;
    position: { x: number; y: number };
    props: ShapeProps;
}

// Props для каждого типа (union type)
export type ShapeProps = CircleProps | RectProps | LineProps | BezierProps;

export interface CircleProps {
    radiusX: number;
    radiusY: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    rotation: number;
}

export interface RectProps {
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    rotation: number;
}

export interface LineProps {
    endX: number;
    endY: number;
    stroke: string;
    strokeWidth: number;
}

export interface BezierProps {
    controlPoints: Array<{ x: number; y: number }>;
    stroke: string;
    strokeWidth: number;
}

// Viewport (размер и смещение холста)
export interface Viewport {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
}
```

---

## Git Workflow

### Ветвление

Используйте feature branches:

```bash
# Создать ветку для холста
git checkout -b feature/canvas-render

# Создать ветку для GUI
git checkout -b feature/gui-toolbar

# Работать на ветке, коммитить
git commit -m "feat(canvas): implement render for circles"

# Merge в main/develop
git pull origin develop
git merge develop
git push origin feature/canvas-render

# Создать Pull Request в GitHub/GitLab
```

### Соглашение о Коммитах

Используйте conventional commits:

```
feat(canvas): add circle rendering
fix(gui): correct property panel layout
docs(readme): update setup instructions
refactor(stores): simplify canvas store
test(math): add hitTest unit tests
```

Префиксы:

- `feat` — новая фича
- `fix` — исправление бага
- `docs` — документация
- `style` — стиль кода (без логики)
- `refactor` — рефакторинг кода
- `test` — добавление тестов
- `chore` — конфиг, зависимости

---

## Code Style

### Naming Conventions

- **Переменные и функции:** `camelCase`

    ```typescript
    const myVariable = 'value';
    function myFunction() {}
    ```

- **Классы и интерфейсы:** `PascalCase`

    ```typescript
    interface MyInterface {}
    class MyClass {}
    ```

- **Константы:** `UPPER_SNAKE_CASE` (опционально для глобальных)

    ```typescript
    const MAX_WIDTH = 800;
    ```

- **Файлы компонентов:** `kebab-case.vue`

    ```
    VectorCanvas.vue → vector-canvas.vue (или PascalCase)
    EditorToolbar.vue → editor-toolbar.vue
    ```

- **Файлы composables и utils:** `kebab-case.ts`
    ```
    useCanvasRender.ts
    useInteractions.ts
    math.ts
    ```

### Структура Импортов

```typescript
// 1. Vue и внешние библиотеки
import { ref, computed, watch, onMounted } from 'vue';
import { defineStore } from 'pinia';

// 2. Абсолютные пути (@/)
import { useCanvasStore } from '@/stores/canvas';
import type { Shape } from '@/canvas/types/shape';

// 3. Релятивные пути (./)
import { math } from './math';
import { draw } from '../utils/render';
```

### TypeScript Типизация

Всегда добавляйте типы:

```typescript
// ✅ Хорошо
function addShape(type: ShapeType, position: { x: number; y: number }): Shape {
    // ...
}

const shapes: Shape[] = [];

// ❌ Плохо
function addShape(type, position) {
    // ...
}

const shapes = [];
```

### Vue Компоненты

Используйте `<script setup>`:

```typescript
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Shape } from '@/canvas/types/shape'

// Props
interface Props {
  shape: Shape
  isSelected: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false
})

// Emits
const emit = defineEmits<{
  select: [id: string]
  update: [shape: Shape]
}>()

// Setup
const count = ref(0)
const doubled = computed(() => count.value * 2)

const handleClick = () => {
  count.value++
}
</script>

<template>
  <div @click="handleClick">
    {{ doubled }}
  </div>
</template>

<style scoped>
/* Всегда используйте scoped styles */
</style>
```

### Форматирование

Запустите перед коммитом:

```bash
npm run lint      # ESLint + Prettier
npm run format    # Только форматирование
npm run type-check # Type-check
```

---

## Полезные Ссылки

- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia Documentation](https://pinia.vuejs.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Vite Documentation](https://vitejs.dev)

---

Вопросы? Смотрите `PLANS.md` для подробного чеклиста разработки этапа 2.
