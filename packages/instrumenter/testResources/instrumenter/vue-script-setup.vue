<template>
  <button type="button" @click="increment">{{ count }}</button>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value = count.value + 1;
}
</script>
