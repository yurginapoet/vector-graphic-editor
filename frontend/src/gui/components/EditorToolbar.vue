<script setup lang="ts">
import { useToolsStore, type ToolType } from '@/stores/tools';
import { useCanvasStore } from '@/stores/canvas';
import { storeToRefs } from 'pinia';
import type { ShapeType } from '@/canvas/types';

const toolsStore = useToolsStore();
const canvasStore = useCanvasStore();
const { activeTool } = storeToRefs(toolsStore);

interface ToolConfig {
    id: ToolType;
    icon: string;
    title: string;
    action?: () => void;
}

const tools: ToolConfig[] = [
    {
        id: 'select',
        icon: '✓',
        title: 'Выделение',
        action: () => toolsStore.setActiveTool('select'),
    },
    {
        id: 'rect',
        icon: '▭',
        title: 'Прямоугольник',
        action: () => addShape('rect'),
    },
    {
        id: 'circle',
        icon: '◯',
        title: 'Круг',
        action: () => addShape('circle'),
    },
    {
        id: 'line',
        icon: '/',
        title: 'Линия',
        action: () => addShape('line'),
    },
];

function handleToolClick(tool: ToolConfig) {
    if (tool.action) {
        tool.action();
    } else {
        toolsStore.setActiveTool(tool.id);
    }
}

function addShape(type: ShapeType) {
    canvasStore.addShape(type, { x: 400, y: 300 });
    toolsStore.setActiveTool('select');
}
</script>

<template>
    <div class="toolbar">
        <h3>Инструменты</h3>
        <div class="button-group">
            <button
                v-for="tool in tools"
                :key="tool.id"
                :class="{ active: activeTool === tool.id }"
                @click="handleToolClick(tool)"
                :title="tool.title"
            >
                {{ tool.icon }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.toolbar {
    padding: 1rem;
    background: #f0f0f0;
    border-right: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

h3 {
    margin: 0;
    font-size: 0.8rem;
    color: #666;
    text-transform: uppercase;
}

.button-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
}

button {
    width: 100%;
    padding: 0.75rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s;
    color: #666;
}

button:hover {
    background: #f5f5f5;
    border-color: #999;
}

button.active {
    background: #2196f3;
    color: white;
    border-color: #1976d2;
}
</style>
