const { add, addOne, isNegativeNumber, negate, sayHello } = require('../../src/add');
const { expect } = require('chai');

describe('Add module', () => {
  it('should be able to add two numbers', () => {
    const num1 = 2;
    const num2 = 5;
    const expected = num1 + num2;

    const actual = add(num1, num2);

    expect(actual).to.be.equal(expected);
  });

  it('should be able 1 to a number', () => {
    const number = 2;
    const expected = 3;

    const actual = addOne(number);

    expect(actual).to.be.equal(expected);
  });

  it('should be able negate a number', () => {
    const number = 2;
    const expected = -2;

    const actual = negate(number);

    expect(actual).to.be.equal(expected);
  });

  it('should be able to recognize a negative number', () => {
    const number = -2;

    const isNegative = isNegativeNumber(number);

    expect(isNegative).to.be.true;
  });

  it('should be able to recognize that 0 is not a negative number', () => {
    const number = 0;

    const isNegative = isNegativeNumber(number);

    expect(isNegative).to.be.false;
  });

  it('should say hi', () => {
    expect(sayHello('world')).eq('👋 world');
  });
});
