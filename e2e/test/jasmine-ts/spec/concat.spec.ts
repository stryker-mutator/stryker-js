import { concat } from '../src/concat.ts';

describe(concat.name, () => {
  it('should concat a and b', () => {
    expect(concat('foo', 'bar')).toBe('foobar');
  })
});
