import { normalizeWhitespaces } from '../../src';
import { expect } from 'chai';

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
});
