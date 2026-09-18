<template>
  <dialog :open="open"></dialog>
</template>

<script>
export const messageId = 'hi';
</script>

<script setup>
const open = defineModel('open');
</script>
