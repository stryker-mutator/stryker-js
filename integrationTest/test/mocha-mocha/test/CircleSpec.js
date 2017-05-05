var expect = require('chai').expect;
var circleModule = require('../src/Circle');
var getCircumference = circleModule.getCircumference;

describe('Circle', function() {
  it('should have a circumference of 2PI when the radius is 1', function() {
    var radius = 1;
    var expectedCircumference = 2 * Math.PI;

    var circumference = getCircumference(radius);

    expect(circumference).to.be.equal(expectedCircumference);
  });
});
