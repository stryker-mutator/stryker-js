import { expect } from 'chai';
import { getCircumference } from '../src/circle.js';

describe('Circle', () => {
  it('should have a circumference of 2PI when the radius is 1', () => {
    const radius = 1;
    const expectedCircumference = 2 * Math.PI;
    const circumference = getCircumference(radius);
    expect(circumference).to.be.equal(expectedCircumference);
  });
});
