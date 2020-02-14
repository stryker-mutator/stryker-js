describe('Add', function() {
  it('this test should fail', function() {
    var num1 = 2;
    var num2 = 5;
    var expected = 0;

    var actual = add(num1, num2);

    expect(actual).toBe(expected);
  });
});
