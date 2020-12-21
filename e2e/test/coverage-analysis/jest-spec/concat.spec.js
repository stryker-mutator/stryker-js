const { concat } = require('../src/concat');

describe(concat.name, () => {
  it('should concat a and b', () => {
    expect(concat('foo', 'bar')).toBe('foobar');
  })
});
