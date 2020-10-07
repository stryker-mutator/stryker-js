import { expect } from 'chai';

import { notEmpty } from '../../src';

describe(notEmpty.name, () => {
  it('should return true when not null or undefined', () => {
    expect(notEmpty('')).true;
    expect(notEmpty(0)).true;
    expect(notEmpty(false)).true;
    expect(notEmpty(NaN)).true;
  });
  it('should return false when null', () => {
    expect(notEmpty(null)).false;
  });
  it('should return false when undefined', () => {
    expect(notEmpty(undefined)).false;
  });
});
