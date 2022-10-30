import { expect } from 'chai';

import { stringWidth } from '../../../src/utils/string-utils.js';

describe('string utils', () => {
  describe('inputLength', () => {
    it('should see an emoji as two characters in lenght', () => {
      const actual = stringWidth('✅ killed');
      expect(actual).to.eq(9);
    });
    it('should support multiple emojis in string', () => {
      const actual = stringWidth('✅✅');
      expect(actual).to.eq(4);
    });
    it('should support this in string', () => {
      const actual = stringWidth('⌛️');
      expect(actual).to.eq(2);
    });
    it('returns input length when no emoji.', () => {
      const s = 'This is a test.';
      const expected = s.length;
      const actual = stringWidth(s);

      expect(actual).to.eq(expected);
    });
  });
});
