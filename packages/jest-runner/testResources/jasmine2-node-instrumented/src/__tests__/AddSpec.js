var add = require('../Add').add;
var addOne = require('../Add').addOne;
var isNegativeNumber = require('../Add').isNegativeNumber;
var negate = require('../Add').negate;

describe('Add', function() {
  it('should be able to add two numbers', function() {
    var num1 = 2;
    var num2 = 5;
    var expected = num1 + num2;

    var actual = add(num1, num2);

    expect(actual).toBe(expected);
  });

  it('should be able to subtract using a negative number', function() {
    var num1 = 5;
    var num2 = -2;
    var expected = num1 + num2;

    var actual = add(num1, num2);

    expect(actual).toBe(expected);
  });
  
  it('should be able to add one to a number', function() {
    var number = 2;
    var expected = 3;

    var actual = addOne(number);

    expect(actual).toBe(expected);
  });

  it('should be able negate a number', function() {
    var number = 2;
    var expected = -2;

    var actual = negate(number);

    expect(actual).toBe(expected);
  });

  it('should be able to recognize a negative number', function() {
    var number = -2;

    var isNegative = isNegativeNumber(number);

    expect(isNegative).toBe(true);
  });

});
