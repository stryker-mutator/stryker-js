import { expect } from 'chai';

import { inputLength } from '../../../src/utils/string-utils.js';

describe('string utils', () => {
  describe('inputLength', () => {
    it('should see an emoji as two characters in lenght', () => {
      const actual = inputLength('✅ killed');
      expect(actual).to.eq(9);
    });
    it('should support multiple emojis in string', () => {
      const actual = inputLength('✅✅');
      expect(actual).to.eq(4);
    });
    it('returns input length when no emoji.', () => {
      const s = 'This is a test.';
      const expected = s.length;
      const actual = inputLength(s);

      expect(actual).to.eq(expected);
    });
  });
});
