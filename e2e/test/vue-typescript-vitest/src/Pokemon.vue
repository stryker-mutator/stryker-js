<template>
  <div>
    <h2>{{ pokemon!.name }}</h2>
    <dl>
      <dt>Type</dt>
      <dd>{{ pokemon!.type }}</dd>
    </dl>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    pokemon: Object
  }
});
</script>
