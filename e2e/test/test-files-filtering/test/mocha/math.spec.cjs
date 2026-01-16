const { add } = require('../../src/math.cjs');
const { expect } = require('chai');

describe('math', () => {
  it('should sum correctly', () => {
    expect(add(1, 2)).to.equal(3);
  });
});
