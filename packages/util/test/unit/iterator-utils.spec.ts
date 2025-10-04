import { expect } from 'chai';

import { filter, map } from '../../src/iterator-utils.js';

describe('iterator-helpers', () => {
  describe(filter.name, () => {
    it('should yield only items that match the predicate', () => {
      const input = [1, 2, 3, 4, 5];
      const isEven = (n: number) => n % 2 === 0;
      const result = Array.from(filter(input, isEven));
      expect(result).to.deep.equal([2, 4]);
    });
  });

  describe(map.name, () => {
    it('should map items using the mapper function', () => {
      const input = [1, 2, 3];
      const mapper = (n: number) => n * 2;
      const result = Array.from(map(input, mapper));
      expect(result).to.deep.equal([2, 4, 6]);
    });
  });
});
