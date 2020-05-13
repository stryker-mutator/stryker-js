import sinon from 'sinon';
import { pokemonService } from './pokemon.service';
import { expect } from 'chai';

describe('pokemon service', () => {

  class TestHelper {
    fetchStub = sinon.stub(globalThis, 'fetch');
  }
  let helper: TestHelper;

  beforeEach(() => {
    helper = new TestHelper();
  });

  describe('getAll', () => {

    it('should fetch pokemon', async () => {
      // Arrange
      const expectedPokemon = [{ name: 'foo', type: 'bar'}];
      helper.fetchStub.resolves({
        json: () => Promise.resolve(expectedPokemon)
      } as Response)
      
      // Act
      const actual = await pokemonService.getAll();

      // Assert
      expect(actual).eq(expectedPokemon);
    });
  });
});
