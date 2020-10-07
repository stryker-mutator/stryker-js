<template>
  <div id="app">
    <h1>Hello Pokemon</h1>
    <PokemonComponent v-for="pok in pokemon" v-bind:key="pok.name" :pokemon="pok"></PokemonComponent>
  </div>
</template>

<script>
import PokemonComponent from './Pokemon.vue'
import { pokemonService } from './pokemon.service';

export default {
  components: {
    PokemonComponent
  },
  data() {
    return {
      pokemon: []
    }
  },

  created() {
    pokemonService.getAll().then(pokemon => (this.pokemon = pokemon));
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
