import { pokemonService } from './pokemon.service';

describe('pokemon service', () => {

  beforeEach(() => {
    fetch.resetMocks();
  });

  describe('getAll', () => {

    it('should fetch pokemon', async () => {
      // Arrange
      const expectedPokemon = [{ name: 'foo', type: 'bar'}];
      fetch.mockResponse(JSON.stringify(expectedPokemon));
      
      // Act
      const actual = await pokemonService.getAll();

      // Assert
      expect(actual).toEqual(expectedPokemon);
    });
  });
});
