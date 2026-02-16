<script setup lang="ts">
import type { PropertyDescriptor } from '@/canvas/types/property';

defineProps<{
    modelValue: number | null;
    descriptor: PropertyDescriptor;
    readonly?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: number | null): void;
}>();
</script>

<template>
    <input
        type="number"
        :min="descriptor.min"
        :max="descriptor.max"
        :step="descriptor.step ?? 'any'"
        :value="modelValue !== null ? modelValue : ''"
        :readonly="readonly"
        @input="
            emit(
                'update:modelValue',
                ($event.target as HTMLInputElement)?.value === ''
                    ? null
                    : parseFloat(($event.target as HTMLInputElement).value)
            )
        "
    />
</template>
