export interface Pokemon {
  name: string;
  type: string;
}

export const pokemonService = {
  async getAll(): Promise<Pokemon[]> {
    const resp = await fetch('/api/pokemon')
    return resp.json();
  }
}
