var multiply = require('../Multiply').multiply;

describe('Multiply', function () {
  it('should be able to multiply two numbers', function () {
    var num1 = 2;
    var num2 = 5;
    var expected = 10;

    var actual = multiply(num1, num2);

    expect(actual).toBe(expected);
  });
});
