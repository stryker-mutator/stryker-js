const { text } = require('../src/big-text');

describe('Big text', () => {
  it('should contain i', () => {
    if (text.indexOf('i') === -1) {
      throw new Error();
    }
  });
});
