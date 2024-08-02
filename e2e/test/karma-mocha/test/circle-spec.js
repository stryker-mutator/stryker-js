import { getCircumference } from '../src/circle.js';
import { expect } from 'chai';

describe('Circle', function () {
  it('should have a circumference of 2PI when the radius is 1', function () {
    var radius = 1;
    var expectedCircumference = 2 * Math.PI;

    var circumference = getCircumference(radius);

    expect(circumference).eq(expectedCircumference);
  });
});
