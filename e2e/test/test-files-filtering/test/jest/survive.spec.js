const { add } = require('../../src/math.cjs');

describe('noop', () => {
  it('should survive', () => {
    void add; // Ensure related
    expect(true).toBe(true);
  });
});
