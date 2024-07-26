import { getCircumference } from '../../src/Circle.js';

describe('Circle', function() {
  it('should have a circumference of 2PI when the radius is 1', function() {
    var radius = 1;
    var expectedCircumference = 2 * Math.PI;

    var circumference = getCircumference(radius);

    expect(circumference).to.be.equal(expectedCircumference);
  });

  it('should skip this test', function() {
    getCircumference(2);
    this.skip();
  });
});
