describe('Circle', function () {
  it('should have a circumference of 2PI when the radius is 1', function () {
    var radius = 1;
    var expectedCircumference = 2 * Math.PI;

    var circumference = getCircumference(radius);

    if (circumference !== expectedCircumference) {
      throw new Error(`Expected ${expectedCircumference} but got ${circumference}`);
    }
  });
});
