import { add, multiply } from '../src/math.js';

describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 0)).toBe(1);
  });
});

describe('multiply', () => {
  it('should multiply the numbers', () => {
    // Bad test, surviving mutant when * => /
    expect(multiply(2, 0)).toBe(0);
  });
});
