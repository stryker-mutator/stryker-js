<template>
  <dialog :open="open">
    <button type="button" @click="toggle">toggle</button>
  </dialog>
</template>

<script setup>
const open = defineModel('open', { default: false });

function toggle() {
  open.value = !open.value;
}
</script>
