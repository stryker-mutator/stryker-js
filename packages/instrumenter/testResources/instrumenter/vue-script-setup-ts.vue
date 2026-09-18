<template>
  <p :class="{ active: isActive }">{{ label }}</p>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{ label?: string; count?: number }>(), {
  label: 'hello',
  count: 0,
});

const isActive = computed(() => props.count > 0);
</script>
