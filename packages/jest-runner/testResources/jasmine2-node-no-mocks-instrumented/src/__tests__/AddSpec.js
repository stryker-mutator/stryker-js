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
});
