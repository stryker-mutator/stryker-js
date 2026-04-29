import { add, negate, isPositive } from '../../src/math.js';

describe('Math', function () {
  it('should be able to add two numbers', function () {
    expect(add(2, 5)).to.equal(7);
  });

  it('should be able to negate a number', function () {
    expect(negate(2)).to.equal(-2);
  });

  it('should detect positive numbers', function () {
    expect(isPositive(5)).to.be.true;
    expect(isPositive(-5)).to.be.false;
  });
});
