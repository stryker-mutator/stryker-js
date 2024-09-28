import { expect } from 'chai';
import { add, addOne, isNegativeNumber, negate } from '../src/add.js';

describe('Add', () => {
  it('should be able to add two numbers', () => {
    const num1 = 2;
    const num2 = 5;
    const expected = num1 + num2;

    const actual = add(num1, num2);

    expect(actual).to.be.equal(expected);
  });

  it('should be able 1 to a number', () => {
    const num = 2;
    const expected = 3;

    const actual = addOne(num);

    expect(actual).to.be.equal(expected);
  });

  it('should be able negate a number', () => {
    const num = 2;
    const expected = -2;

    const actual = negate(num);

    expect(actual).to.be.equal(expected);
  });

  it('should be able to recognize a negative number', () => {
    const num = -2;

    const isNegative = isNegativeNumber(num);

    expect(isNegative).to.be.true;
  });

  it('should be able to recognize that 0 is not a negative number', () => {
    const num = 0;

    const isNegative = isNegativeNumber(num);

    expect(isNegative).to.be.false;
  });
});
