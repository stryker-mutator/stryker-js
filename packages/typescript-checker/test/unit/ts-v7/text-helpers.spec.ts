import { expect } from 'chai';

import { positionToOffset } from '../../../src/ts-v7/text-helpers.js';

describe('ts-v7 text helpers', () => {
  describe(positionToOffset.name, () => {
    it('should calculate the offset on the first line', () => {
      expect(positionToOffset('const foo = 42;', { line: 0, column: 6 })).eq(6);
    });

    it('should calculate the offset on a subsequent line', () => {
      expect(
        positionToOffset('const foo = 42;\nconst bar = 43;', {
          line: 1,
          column: 6,
        }),
      ).eq(22);
    });

    it('should support carriage return line endings', () => {
      expect(
        positionToOffset('const foo = 42;\r\nconst bar = 43;', {
          line: 1,
          column: 0,
        }),
      ).eq(17);
    });

    it('should throw when the line is out of bounds', () => {
      expect(() =>
        positionToOffset('const foo = 42;', { line: 2, column: 0 }),
      ).throws('out of bounds');
    });
  });
});
