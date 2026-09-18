<template>
  <p :title="title">{{ upperTitle }}</p>
</template>

<script>
export const DEFAULT_TITLE = 'hello';
</script>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, default: DEFAULT_TITLE },
});

const upperTitle = computed(() => props.title.toUpperCase());
</script>
