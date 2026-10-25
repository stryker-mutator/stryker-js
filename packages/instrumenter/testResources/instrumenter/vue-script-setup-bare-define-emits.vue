<template>
  <button type="button" @click="$emit('close')">close</button>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'close'): void }>();
</script>
