<template>
  <p>{{ greeting }}</p>
</template>

<script setup>
import { computed } from 'vue';

const greeting = computed(() => DEFAULT_NAME.toUpperCase() + '!');
</script>

<script>
export const DEFAULT_NAME = 'world';
</script>
