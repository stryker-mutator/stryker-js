import { currency } from '../../src/pipes/currency.pipe.js';

describe(currency.name, () => {
  it("should prefix with '€'", () => {
    expect(currency(1)).toContain('€');
  });
});
