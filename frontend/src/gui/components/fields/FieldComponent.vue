<script setup lang="ts">
import { computed } from 'vue';
import { getField } from './index';
import FieldRenderer from './FieldRenderer.vue';
import type { PropertyDescriptor } from '@/canvas/types/property';

interface Props {
    descriptor: PropertyDescriptor;
    modelValue: unknown;
    readonly?: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: unknown): void;
}

const props = withDefaults(defineProps<Props>(), {
    readonly: false,
});

const emit = defineEmits<Emits>();

const field = computed(
    () => getField(props.descriptor.type) || getField('string')!
);
</script>

<template>
    <FieldRenderer
        :field="field"
        :descriptor="descriptor"
        :modelValue="modelValue"
        :readonly="readonly"
        @update:modelValue="(val) => emit('update:modelValue', val)"
    />
</template>
