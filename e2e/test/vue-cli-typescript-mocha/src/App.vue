<template>
  <div id="app">
    <h1>Hello Pokemon</h1>
    <component-pokemon v-for="pok in pokemon" v-bind:key="pok.name" :pokemon="pok"></component-pokemon>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { pokemonService, Pokemon } from './pokemon.service';
import PokemonVue from './Pokemon.vue';

export default defineComponent({
  components: {
    ['component-pokemon']: PokemonVue
  },
  data(): { pokemon: Pokemon[]} {
    return {
      pokemon: []
    }
  },

  created() {
    pokemonService.getAll().then(pokemon => (this.pokemon = pokemon));
  }
});
</script>
