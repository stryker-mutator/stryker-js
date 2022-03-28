import { expect } from 'chai';
import MyMath from './MyMath.js';

describe('MyMath', function () {
  var myMath;

  beforeEach(function () {
    try {
      myMath = new MyMath();
    } catch (err) {
      console.log(err);
    }
  });

  it('should be able to add two numbers', function () {
    var num1 = 2;
    var num2 = 5;
    var expected = num1 + num2;

    var actual = myMath.add(num1, num2);

    expect(actual).to.equal(expected);
  });

  it('should be able 1 to a number', function () {
    var number = 2;
    var expected = 3;

    var actual = myMath.addOne(number);

    expect(actual).to.equal(expected);
  });

  it('should be able negate a number', function () {
    var number = 2;
    var expected = -2;

    var actual = myMath.negate(number);

    expect(actual).to.equal(expected);
  });

  it('should be able to recognize a negative number', function () {
    var number = -2;

    var isNegative = myMath.isNegativeNumber(number);

    expect(isNegative).to.equal(true);
  });

  it('should be able to recognize that 0 is not a negative number', function () {
    var number = 0;

    var isNegative = myMath.isNegativeNumber(number);

    expect(isNegative).to.equal(false);
  });
});
