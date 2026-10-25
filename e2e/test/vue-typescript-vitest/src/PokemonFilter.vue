<template>
  <label>
    {{ label }}
    <select v-model="type">
      <option value="all">All</option>
      <option value="fire">Fire</option>
      <option value="water">Water</option>
    </select>
  </label>
</template>
<script setup lang="ts">
defineProps({
  label: { type: String, default: 'Filter by type' },
});

const type = defineModel('type', { default: 'all' });
</script>
