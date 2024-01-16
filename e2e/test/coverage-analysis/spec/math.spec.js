import { add, multiply } from '../src/math.js';
describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});

describe('multiply', () => {
  it('should multiply the numbers', () => {
    // Bad test, surviving mutant when * => /
    expect(multiply(2, 1)).toBe(2);
  });
});

// Missing describe for `addOne` -> surviving / noCoverage mutant
