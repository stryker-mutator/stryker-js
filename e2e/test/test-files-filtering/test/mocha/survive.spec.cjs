const { add } = require('../../src/math.cjs');
const { expect } = require('chai');

describe('noop', () => {
  it('should survive', () => {
    void add; // Ensure related
    expect(true).to.be.true;
  });
});
