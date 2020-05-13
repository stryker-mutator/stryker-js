<template>
  <div>
    <h2>{{ pokemon.name }}</h2>
    <dl>
      <dt>Type</dt>
      <dd>{{ pokemon.type }}</dd>
    </dl>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { pokemonService } from './pokemon.service';

export default Vue.extend({
  props: {
    pokemon: Object
  }
});
</script>
