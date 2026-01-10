const { add } = require('../../src/math.cjs');

describe('math', () => {
  it('should sum correctly', () => {
    expect(add(1, 2)).toBe(3);
  });
});
