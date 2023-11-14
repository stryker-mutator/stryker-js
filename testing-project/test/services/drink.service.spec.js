import { jest } from '@jest/globals';

import { DrinkService } from '../../src/services/drink.service.js';
import { createDrink } from '../helpers.js';

describe(DrinkService.name, () => {
  /** @type {import('jest-mock').MockInstance<typeof fetch>} */
  let fetchMock;
  /** @type {DrinkService} */
  let sut;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch');
    sut = new DrinkService();
  });

  it('should retrieve drinks from the server when getDrinks is called', async () => {
    const expectedDrinks = [createDrink()];
    fetchMock.mockResolvedValue(new Response(JSON.stringify(expectedDrinks)));
    const actual = await sut.getDrinks();
    expect(actual).toStrictEqual(expectedDrinks);
  });
});
