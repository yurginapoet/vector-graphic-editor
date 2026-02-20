<template>
  <div class="toolbar" aria-label="Tools">
    <button
      v-for="tool in tools"
      :key="tool.id"
      class="toolBtn"
      :class="{ active: tool.id === activeId }"
      type="button"
      :title="tool.title"
      @click="activeId = tool.id"
    >
      <component :is="tool.icon" class="lucideIcon" :size="18" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Component } from 'vue'
import {
  Hand,
  MousePointer2,
  Pencil,
  Minus,
  Square,
  Circle,
  Spline,
  Eraser,
  Type,
} from 'lucide-vue-next'

type ToolId =
  | 'hand'
  | 'cursor'
  | 'pencil'
  | 'line'
  | 'rect'
  | 'circle'
  | 'curve'
  | 'eraser'
  | 'text'

type Tool = {
  id: ToolId
  title: string
  icon: Component
}

const tools: Tool[] = [
  { id: 'hand', title: 'Рука', icon: Hand },
  { id: 'cursor', title: 'Курсор', icon: MousePointer2 },
  { id: 'pencil', title: 'Карандаш', icon: Pencil },
  { id: 'line', title: 'Линия', icon: Minus },
  { id: 'rect', title: 'Прямоугольник', icon: Square },
  { id: 'circle', title: 'Круг', icon: Circle },
  { id: 'curve', title: 'Кривая линия', icon: Spline },
  { id: 'eraser', title: 'Ластик', icon: Eraser },
  { id: 'text', title: 'Текст', icon: Type },
]

const activeId = ref<ToolId>('cursor')
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 8px 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.toolBtn {
  width: 36px;
  height: 36px;

  display: grid;
  place-items: center;

  background: #ffffff;
  border: 1px solid transparent;
  border-radius: 10px;

  cursor: pointer;
  color: #111827;
}

.toolBtn:hover {
  background: #f3f4f6;
}

.toolBtn.active {
  background: rgba(37, 99, 235, 0.15);
  border-color: rgba(37, 99, 235, 0.35);
  color: #2563eb;
}


.lucideIcon {
  display: block;
}
</style>