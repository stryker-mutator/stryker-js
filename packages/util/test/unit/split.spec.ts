import { expect } from 'chai';

import { split } from '../../src/index.js';

describe(split.name, () => {
  it('should split into empty arrays when input is empty', () => {
    const [left, right] = split([], () => true);

    expect(left).lengthOf(0);
    expect(right).lengthOf(0);
  });

  it('should split all values left when predicate is true', () => {
    const input = [1, 2, 3];
    const [left, right] = split(input, () => true);

    expect(left).deep.eq(input);
    expect(right).lengthOf(0);
  });

  it('should split all values right when predicate is false', () => {
    const input = [1, 2, 3];
    const [left, right] = split(input, () => false);

    expect(right).deep.eq(input);
    expect(left).lengthOf(0);
  });

  it('should provide value to predicate', () => {
    const input = [1, 2, 3];
    const [left, right] = split(input, (value) => value % 2 === 0);

    expect(left).deep.eq([2]);
    expect(right).deep.eq([1, 3]);
  });

  it('should provide index to predicate', () => {
    const input = ['f', 'o', 'b'];
    const [left, right] = split(input, (_, index) => index % 2 === 0);

    expect(left).deep.eq(['f', 'b']);
    expect(right).deep.eq(['o']);
  });
});
