import { expect } from 'chai';

import { normalizeWhitespaces, propertyPath, escapeRegExp } from '../../src';

describe('stringUtils', () => {
  describe(normalizeWhitespaces.name, () => {
    it('should not change strings without consecutive whitespaces', () => {
      expect(normalizeWhitespaces('foo bar baz')).eq('foo bar baz');
    });

    it('should normalize a string with multiple consecutive spaces', () => {
      expect(normalizeWhitespaces('foo  bar   baz')).eq('foo bar baz');
    });

    it('should normalize a string with multiple consecutive spaces, tabs and new lines', () => {
      expect(normalizeWhitespaces('foo \t \n bar\n\tbaz')).eq('foo bar baz');
    });
  });

  describe(propertyPath.name, () => {
    interface Foo {
      bar: {
        baz: string;
      };
    }

    it('should be able to point to a path', () => {
      expect(propertyPath<Foo>('bar', 'baz')).eq('bar.baz');
    });
  });

  describe(escapeRegExp.name, () => {
    it('should return input if no special chars are found', () => {
      expect(escapeRegExp('something normal')).eq('something normal');
    });

    for (const letter of '.*+-?^${}()|[]\\') {
      it(`should escape "${letter}"`, () => {
        expect(escapeRegExp(letter)).eq(`\\${letter}`);
      });
    }
  });
});
