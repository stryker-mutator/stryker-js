export const pokemonService = {
  async getAll() {
    const resp = await fetch('/api/pokemon')
    return resp.json();
  }
}
