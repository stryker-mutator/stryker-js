function equal(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${expected} but got ${actual}`);
  }
}
describe('Add', function () {
  it('should be able to add two numbers', function (done) {
    var num1 = 2;
    var num2 = 5;
    var expected = num1 + num2;

    var actual = add(num1, num2);

    equal(actual, expected);
    window.setTimeout(function () {
      done();
    }, 20);
  });

  it('should be able 1 to a number', function () {
    var number = 2;
    var expected = 3;

    var actual = addOne(number);

    equal(actual, expected);
  });

  it('should be able negate a number', function () {
    var number = 2;
    var expected = -2;

    var actual = negate(number);

    equal(actual, expected);
  });

  it('should be able to recognize a negative number', function () {
    var number = -2;

    var isNegative = isNegativeNumber(number);

    equal(isNegative, true);
  });

  it('should be able to recognize that 0 is not a negative number', function () {
    var number = 0;

    var isNegative = isNegativeNumber(number);

    equal(isNegative, false);
  });
});
