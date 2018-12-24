describe('Add', function() {
  it('should be able to add two numbers', function() {
    var num1 = 2;
    var num2 = 5;
    var expected = num1 + num2;

    var actual = add(num1, num2);

    expect(actual).toBe(expected);
  });

  it('should be able 1 to a number', function() {
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
});
