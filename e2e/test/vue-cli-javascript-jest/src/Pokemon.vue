<template>
  <div>
    <h2>{{ pokemon.name }}</h2>
    <dl>
      <dt>Type</dt>
      <dd>{{ pokemon.type }}</dd>
    </dl>
  </div>
</template>
<script>
import Vue from 'vue';

export default {
  name: 'PokemonComponent',
  props: {
    pokemon: Object
  }
};
</script>
