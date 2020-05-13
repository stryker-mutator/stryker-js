import { concat } from '../src/concat';
import { expect } from 'chai';

describe(concat.name, () => {
  it('should concat a and b', () => {
    expect(concat('foo', 'bar')).eq('foobar');
  })
});
