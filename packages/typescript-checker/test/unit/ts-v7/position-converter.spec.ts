import { expect } from 'chai';

import { PositionConverter } from '../../../src/ts-native/position-converter.js';

describe(PositionConverter.name, () => {
  describe(PositionConverter.prototype.positionFromOffset.name, () => {
    it('should resolve position at start of file', () => {
      const sut = new PositionConverter('const foo = 42;');

      expect(sut.positionFromOffset(0)).deep.eq({ line: 1, column: 1 });
    });

    it('should resolve offsets between line starts', () => {
      const sut = new PositionConverter('const foo = 42;\nconst bar = 43;');

      expect(sut.positionFromOffset(20)).deep.eq({ line: 2, column: 5 });
    });

    it('should support CRLF line endings', () => {
      const sut = new PositionConverter('a\r\nb');

      expect(sut.positionFromOffset(3)).deep.eq({ line: 2, column: 1 });
    });

    it('should support unicode line separators', () => {
      const sut = new PositionConverter('a\u2028b\u2029c');

      expect(sut.positionFromOffset(2)).deep.eq({ line: 2, column: 1 });
      expect(sut.positionFromOffset(4)).deep.eq({ line: 3, column: 1 });
    });

    it('should throw when offset precedes start of file', () => {
      const sut = new PositionConverter('abc');

      expect(() => sut.positionFromOffset(-1)).throws(
        'position cannot precede the beginning of the file',
      );
    });
  });
});
