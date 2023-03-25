import { EOL } from 'os';

import { expect } from 'chai';

import { StringBuilder } from '../../../src/utils/string-builder.js';

describe(StringBuilder.name, () => {
  describe('toString', () => {
    it('should append strings without separator when `toString()` is called', () => {
      const sut = new StringBuilder();
      sut.append('1');
      sut.append('2');
      sut.append('3');
      expect(sut.toString()).eq('123');
    });

    const DEFAULT_MAX_CHARACTERS = 2048;
    it(`should append a to maximum of ${DEFAULT_MAX_CHARACTERS} characters by default`, () => {
      const sut = new StringBuilder();
      for (let i = 0; i < DEFAULT_MAX_CHARACTERS; i++) {
        sut.append('.');
      }
      sut.append('expected');
      const result = sut.toString();
      expect(result).lengthOf(DEFAULT_MAX_CHARACTERS);
      const expectedLastPart = '...expected';
      expect(result.substr(result.length - expectedLastPart.length)).eq(expectedLastPart);
    });

    it('should not split the last string, even if it exceeds the max characters', () => {
      const input = new Array(DEFAULT_MAX_CHARACTERS + 1).fill('.').join('');
      const sut = new StringBuilder();
      sut.append(input);
      expect(sut.toString()).eq(input);
    });
  });

  describe('concat', () => {
    it('should concatenate multiple string builders with new lines', () => {
      const stringBuilders = [new StringBuilder(), new StringBuilder()];
      stringBuilders[0].append('foo');
      stringBuilders[0].append('bar');
      stringBuilders[1].append('baz');
      expect(StringBuilder.concat(...stringBuilders)).eq(`foobar${EOL}baz`);
    });
    it('should remove empty builders', () => {
      const stringBuilders = [new StringBuilder(), new StringBuilder(), new StringBuilder()];
      stringBuilders[0].append('foo');
      stringBuilders[0].append('bar');
      stringBuilders[2].append('baz');
      expect(StringBuilder.concat(...stringBuilders)).eq(`foobar${EOL}baz`);
    });
  });
});
