# План Разработки Vibe Editor

## Этап 1: Болванка (Завершён ✓)

Базовая структура репозитория и скелет приложения созданы:

- ✓ Инициализирован проект Vite + Vue 3 + TypeScript + Pinia
- ✓ Настроены ESLint, Prettier, OxLint
- ✓ Создана файловая структура (canvas/, gui/, stores/, shared/)
- ✓ Созданы пустые компоненты и stores (placeholders)
- ✓ Dev server запускается (`npm run dev`)

---

## Этап 2: MVP (Базовые Функции)

### Цель

Реализовать минимально жизнеспособный продукт с базовым функционалом создания и редактирования простых векторных фигур.

### Архитектурные Принципы

- **Разделение слоев:** Холст (рендер + взаимодействия) отделён от GUI (интерфейс)
- **Состояние:** Централизованное управление через Pinia stores
- **Производительность:** Базовая (без оптимизаций debounce/буфера на этом этапе)
- **Расширяемость:** Легко добавлять новые фигуры и функции

---

## Чеклист Разработки Этапа 2

### Блок 1: Типы и Интерфейсы

**Файл:** `src/canvas/types/shape.ts`

- [ ] Определить базовый интерфейс `Shape`
    - `id: string` (уникальный ID)
    - `type: 'circle' | 'rect' | 'line' | 'bezier'`
    - `position: { x: number; y: number }` (центр для circle/rect, начало для line/bezier)
    - `props: ShapeProps` (свойства, зависящие от типа)
- [ ] Определить интерфейсы для каждого типа фигуры:

    ```ts
    interface CircleShape extends Shape {
        type: 'circle';
        props: {
            radiusX: number;
            radiusY: number;
            fill: string;
            stroke: string;
            strokeWidth: number;
            rotation: number;
        };
    }

    interface RectShape extends Shape {
        type: 'rect';
        props: {
            width: number;
            height: number;
            fill: string;
            stroke: string;
            strokeWidth: number;
            rotation: number;
        };
    }

    interface LineShape extends Shape {
        type: 'line';
        props: {
            endX: number;
            endY: number;
            stroke: string;
            strokeWidth: number;
        };
    }

    interface BezierShape extends Shape {
        type: 'bezier';
        props: {
            controlPoints: Array<{ x: number; y: number }>;
            stroke: string;
            strokeWidth: number;
        };
    }
    ```

- [ ] Определить интерфейс `Viewport`

    ```ts
    interface Viewport {
        width: number;
        height: number;
        offsetX: number;
        offsetY: number;
    }
    ```

- [ ] Определить тип `ShapeType = 'circle' | 'rect' | 'line' | 'bezier'`

- [ ] Экспортировать все типы

---

### Блок 2: Pinia Store (Canvas)

**Файл:** `src/stores/canvas.ts`

- [ ] Создать интерфейс `CanvasState`

    ```ts
    interface CanvasState {
        shapes: Shape[];
        selectedId: string | null;
        viewport: Viewport;
        lastShapeId: number;
    }
    ```

- [ ] Реализовать actions:
    - [ ] `addShape(type: ShapeType, position: { x; y })` — добавить фигуру (с дефолтными props)
    - [ ] `updateShape(id: string, updates: Partial<Shape>)` — обновить свойства фигуры
    - [ ] `deleteShape(id: string)` — удалить фигуру
    - [ ] `selectShape(id: string | null)` — выбрать/отменить выбор фигуры
    - [ ] `updateViewport(viewport: Viewport)` — обновить viewport (для resize холста)

- [ ] Реализовать getters:
    - [ ] `selectedShape` — вернуть выбранную фигуру (или null)
    - [ ] `shapeCount` — количество фигур

- [ ] Настроить состояние по умолчанию (пустой массив фигур, null selectedId, дефолтный viewport)

---

### Блок 3: Pinia Store (Tools)

**Файл:** `src/stores/tools.ts`

- [ ] Создать интерфейс `ToolsState`

    ```ts
    interface ToolsState {
        activeTool: 'select' | 'circle' | 'rect' | 'line' | 'bezier';
    }
    ```

- [ ] Реализовать actions:
    - [ ] `setActiveTool(tool: ToolType)` — установить активный инструмент

- [ ] Настроить состояние по умолчанию (`activeTool: 'select'`)

---

### Блок 4: Утилиты Холста

**Файл:** `src/canvas/utils/math.ts`

- [ ] Реализовать функции:
    - [ ] `getBoundingBox(shape: Shape): { minX, minY, maxX, maxY }` — вычислить bounding box фигуры
    - [ ] `hitTest(shape: Shape, point: { x, y }): boolean` — проверить, попадает ли точка в фигуру (по bounding box для MVP)
    - [ ] `distance(p1, p2): number` — расстояние между точками
    - [ ] `generateId(): string` — генерировать уникальный ID (например, `Date.now() + Math.random()`)

---

### Блок 5: Composable для Рендера

**Файл:** `src/canvas/composables/useCanvasRender.ts`

- [ ] Функция должна быть called из Canvas.vue component
- [ ] Вернуть объект с методами:
    - [ ] `draw(ctx: CanvasRenderingContext2D, shapes: Shape[], selectedId?: string)` — отрисовать все фигуры
        - Для каждой фигуры вызвать специальную функцию рендера
        - Если фигура выбрана, отрисовать её с рамкой (bounding box)
- [ ] Реализовать приватные функции рендера для каждого типа:
    - [ ] `drawCircle(ctx, shape: CircleShape, isSelected: boolean)`
    - [ ] `drawRect(ctx, shape: RectShape, isSelected: boolean)`
    - [ ] `drawLine(ctx, shape: LineShape, isSelected: boolean)`
    - [ ] `drawBezier(ctx, shape: BezierShape, isSelected: boolean)` (пока без control points)
- [ ] Helper функция `drawSelectionBox(ctx, boundingBox)` — отрисовать рамку вокруг выбранной фигуры (жирный цвет, например, синий)

---

### Блок 6: Composable для Взаимодействий

**Файл:** `src/canvas/composables/useInteractions.ts`

- [ ] Функция должна быть вызвана из Canvas.vue component
- [ ] Обработать события мыши:
    - [ ] `mousedown` — выбрать фигуру (hitTest), начать drag
    - [ ] `mousemove` — если фигура выбрана и зажата кнопка, обновить её позицию (drag)
    - [ ] `mouseup` — завершить drag
    - [ ] `dblclick` — опционально (пока не требуется, можно оставить пусто)
- [ ] Вернуть функции:
    - [ ] `startDrag(position: { x, y })` — начать перемещение
    - [ ] `updateDrag(position: { x, y })` — обновить позицию при перемещении
    - [ ] `endDrag()` — завершить перемещение
    - [ ] `selectShapeAtPoint(point: { x, y })` — выбрать фигуру по точке
    - [ ] `deselect()` — отменить выбор

---

### Блок 7: Composable для Управления Фигурами

**Файл:** `src/canvas/composables/useShapes.ts`

- [ ] Предоставить удобные функции для работы с фигурами:
    - [ ] `addShape(type: ShapeType, position: { x, y })` — добавить фигуру (работает с canvasStore)
    - [ ] `deleteSelectedShape()` — удалить выбранную фигуру
    - [ ] `updateSelectedShapeProps(props: Partial)` — обновить свойства выбранной фигуры
- [ ] Вернуть объект с этими методами для использования в компонентах

---

### Блок 8: Компонент Canvas.vue

**Файл:** `src/canvas/components/VectorCanvas.vue`

- [ ] Шаблон:
    - [ ] `<canvas ref="canvasEl" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp"></canvas>`
    - [ ] Применить стили (width, height = 100%, border, cursor)
- [ ] Setup:
    - [ ] Получить reference на `<canvas>` элемент
    - [ ] Инициализировать context 2D
    - [ ] Подписаться на изменения store.shapes и store.selectedId (watch)
    - [ ] При изменениях вызвать redraw (используя useCanvasRender)
- [ ] Event handlers:
    - [ ] `onMouseDown(event: MouseEvent)` — вызвать selectShapeAtPoint и startDrag из useInteractions
    - [ ] `onMouseMove(event: MouseEvent)` — вызвать updateDrag
    - [ ] `onMouseUp(event: MouseEvent)` — вызвать endDrag
- [ ] Resize canvas при resize окна (ResizeObserver или простой window listener с resize event)

- [ ] Mounted hook: Установить viewport в store (canvas.width, canvas.height)

---

### Блок 9: Composable для GUI (Tools)

**Файл:** `src/gui/composables/useTools.ts`

- [ ] Предоставить методы для работы с инструментами:
    - [ ] `selectTool(toolName: ToolType)` — выбрать инструмент (обновить toolsStore)
    - [ ] `addShapeWithTool(position: { x, y })` — добавить фигуру текущего инструмента
    - [ ] `getActiveTool()` — вернуть текущий инструмент
- [ ] Вернуть объект с этими методами

---

### Блок 10: Компонент Toolbar.vue

**Файл:** `src/gui/components/EditorToolbar.vue`

- [ ] Шаблон:
    - [ ] Toolbar контейнер (display: flex, padding)
    - [ ] Кнопки для каждого инструмента:
        - [ ] "Select" (class "active" если activeTool === 'select')
        - [ ] "Add Circle"
        - [ ] "Add Rect"
        - [ ] "Add Line"
        - [ ] "Add Bezier"
    - [ ] Разделитель и кнопка "Delete" (если выбрана фигура)
- [ ] Event handlers:
    - [ ] `onSelectTool(toolName)` — вызвать selectTool из useTools
    - [ ] `onAddShape(type)` — можно вызвать прямо из Toolbar (если активен инструмент)
    - [ ] `onDelete()` — удалить выбранную фигуру (deleteSelectedShape из useShapes)
- [ ] Стили:
    - [ ] Кнопка с :active/hover стилями
    - [ ] Активная кнопка выделена (background-color, border, etc.)

---

### Блок 11: Компонент PropertiesPanel.vue

**Файл:** `src/gui/components/PropertiesPanel.vue`

- [ ] Шаблон:
    - [ ] Panel контейнер (sidebar style, padding, border)
    - [ ] Заголовок "Properties"
    - [ ] v-if selectedShape (показать форму свойств, иначе "No shape selected")
- [ ] Форма:
    - [ ] Зависит от типа фигуры (v-if по типу)
    - [ ] Для Circle: radiusX, radiusY input'ы, color picker, strokeWidth slider
    - [ ] Для Rect: width, height, color picker, strokeWidth
    - [ ] Для Line: (position читается из основной фигуры), end position, color, strokeWidth
    - [ ] Для Bezier: (read-only пока), color, strokeWidth
- [ ] Event handlers:
    - [ ] `@input` или `@change` на inputs — вызвать updateSelectedShapeProps
    - [ ] v-model binding для удобства
- [ ] Стили: Чистая, простая форма без излишеств

---

### Блок 12: Корневой Компонент App.vue

**Файл:** `src/App.vue`

- [ ] Шаблон:
    - [ ] Main layout контейнер (display: grid или flex)
    - [ ] Header: Toolbar (`<EditorToolbar />`)
    - [ ] Main content: Два столбца
        - [ ] Левый: Canvas (`<VectorCanvas />`) — flex: 1
        - [ ] Правый: PropertiesPanel (`<PropertiesPanel />`) — width: 300px
    - [ ] Стили для правильного layout (grid-template-areas или flex)
- [ ] Могут быть глобальные стили (reset, fonts, colors)

---

### Блок 13: Интеграция Pinia

**Файл:** `src/stores/index.ts`

- [ ] Экспортировать оба store (canvas и tools)
- [ ] Можно создать файл как главную точку входа для stores

---

### Блок 14: Базовые Стили

**Файл:** `src/App.vue` и компоненты

- [ ] Глобальные стили в `<style>` блоке App.vue:
    - [ ] Reset (\*, html, body)
    - [ ] Основные цвета и шрифты
    - [ ] Layout стили (grid/flex для layout)
    - [ ] Canvas стили (белый фон, border)
- [ ] Скопированные стили в каждый компонент (scoped):
    - [ ] Toolbar: display flex, padding, gap между кнопками
    - [ ] PropertiesPanel: sidebar style
    - [ ] Canvas: 100% width/height, border

---

### Блок 15: Тестирование (Базовое, Опционально)

**Файлы:** `src/stores/__tests__/canvas.test.ts`, `src/stores/__tests__/tools.test.ts` (если есть Jest)

- [ ] Unit-тесты для stores (если нужны):
    - [ ] Test addShape: проверить, что фигура добавлена с правильными свойствами
    - [ ] Test updateShape: обновление работает
    - [ ] Test selectShape: выбор работает
    - [ ] Test deleteShape: удаление работает
- [ ] Unit-тесты для math.ts:
    - [ ] Test getBoundingBox
    - [ ] Test hitTest
    - [ ] Test distance
- [ ] На MVP можно оставить тестирование базовым или пропустить

---

### Блок 16: Документация и Коммиты

**Файл:** `README.md`, коммиты git

- [ ] Обновить README.md с описанием MVP
- [ ] Добавить section "How to Use" (как добавлять фигуры, как выбирать, как менять свойства)
- [ ] Коммиты делать логичными (по блокам/фичам)
- [ ] Branch naming: `feature/canvas-render`, `feature/gui-toolbar`, `feature/stores`, etc.

---

## Распределение Работы (для двух разработчиков)

### Dev 1: Холст (Canvas)

- Блоки 1, 2, 4, 5, 6, 7, 8
- Обеспечить API для взаимодействия (emits, actions)

### Dev 2: GUI

- Блоки 3, 9, 10, 11, 12, 13
- Обеспечить интеграцию с Canvas API

### Параллельно

- Оба работают на своих branches
- Regular merge в main (или develop)
- Синхронизация типов через canvas/types/shape.ts

---

## Критерии Готовности Этапа 2

✓ Приложение запускается без ошибок (`npm run dev`)
✓ Можно добавить фигуру через Toolbar
✓ Можно выбрать фигуру кликом на холсте
✓ Можно переместить выбранную фигуру (drag)
✓ Можно изменить свойства фигуры в PropertiesPanel
✓ Можно удалить фигуру через кнопку в Toolbar
✓ Можно создать сцену с 5-10 фигурами без лагов
✓ Все типы фигур отрисовываются корректно
✓ Выбранная фигура выделена визуально (рамка)

---

## Этап 3: Итоговый Продукт (Future)

Не приступать до завершения Этапа 2. Будет детализирован отдельно.

Основные фичи:

- Debounce/throttle на рендер
- Offscreen буфер для оптимизации
- Zoom/pan с viewport transform
- Resize/rotate с handles
- Undo/redo
- Floating Properties Panel
- Full Bezier editing
- Экспорт/импорт
- Слои и группировка
