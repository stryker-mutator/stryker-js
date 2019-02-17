var getCircumference = require('../Circle').getCircumference;

describe('Circle', function() {
  it('should have a circumference of 2PI when the radius is 1', function() {
    var radius = 1;
    var expectedCircumference = 2 * Math.PI;

    var circumference = getCircumference(radius);

    expect(circumference).toBe(expectedCircumference);
  });
});