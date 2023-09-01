import { pokemonService } from '../src/pokemon.service';
import { describe, it, expect, vi } from 'vitest';

describe('pokemon service', () => {
  describe('getAll', () => {
    it('should fetch pokemon', async () => {
      // Arrange
      const expectedPokemon = [{ name: 'foo', type: 'bar' }];
      vi.stubGlobal('fetch', () => Promise.resolve({ json: () => new Promise((resolve) => resolve(expectedPokemon)) }));

      // Act
      const actual = await pokemonService.getAll();

      // Assert
      expect(actual).eq(expectedPokemon);
    });
  });
});
