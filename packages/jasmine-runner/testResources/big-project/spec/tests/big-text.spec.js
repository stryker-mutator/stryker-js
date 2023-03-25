const { text } = require('../../lib/big-text');

describe('Big text', () => {
  it('should contain i', () => {
    if (text.indexOf('i') === -1) {
      throw new Error();
    }
  });

  // Leave the garbage collector room to breath
  afterEach(() => new Promise((res) => setTimeout(res, 100)));
});
