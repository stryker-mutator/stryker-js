<template>
  <p>{{ label }}</p>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'hello' });
</script>
