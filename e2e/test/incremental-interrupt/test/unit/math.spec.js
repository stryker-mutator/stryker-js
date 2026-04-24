import { add, addOne, negate, isNegativeNumber, multiply, subtract, isPositive, absolute, max, min } from '../../src/math.js';

// A helper that introduces a small delay per test invocation.
// This ensures the mutation testing phase doesn't complete instantly,
// giving the e2e test time to receive the __MUTANT_TESTED__ signal
// and send SIGTERM before all mutants are tested.
function slow(fn) {
  return function (done) {
    fn();
    setTimeout(done, 50);
  };
}

describe('Math', function () {
  it('should be able to add two numbers', slow(function () {
    expect(add(2, 5)).to.equal(7);
  }));

  it('should be able to add 1 to a number', slow(function () {
    expect(addOne(2)).to.equal(3);
  }));

  it('should be able to negate a number', slow(function () {
    expect(negate(2)).to.equal(-2);
  }));

  it('should detect negative numbers', slow(function () {
    expect(isNegativeNumber(-1)).to.be.true;
    expect(isNegativeNumber(1)).to.be.false;
  }));

  it('should multiply two numbers', slow(function () {
    expect(multiply(3, 4)).to.equal(12);
  }));

  it('should subtract two numbers', slow(function () {
    expect(subtract(10, 3)).to.equal(7);
  }));

  it('should detect positive numbers', slow(function () {
    expect(isPositive(5)).to.be.true;
    expect(isPositive(-5)).to.be.false;
  }));

  it('should return the absolute value', slow(function () {
    expect(absolute(-5)).to.equal(5);
    expect(absolute(5)).to.equal(5);
  }));

  it('should return the max of two numbers', slow(function () {
    expect(max(3, 7)).to.equal(7);
    expect(max(7, 3)).to.equal(7);
  }));

  it('should return the min of two numbers', slow(function () {
    expect(min(3, 7)).to.equal(3);
    expect(min(7, 3)).to.equal(3);
  }));
});
