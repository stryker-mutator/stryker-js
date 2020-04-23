import { expect } from 'chai';

import { deepFreeze } from '../../src/Immutable';

describe(deepFreeze.name, () => {
  it('should not change the input object', () => {
    const input = {};
    deepFreeze(input);
    expect(input).not.frozen;
  });

  it('should freeze objects', () => {
    const input = { foo: 'bar', baz: 42 };
    const output = deepFreeze(input);
    expect(output).frozen;
    expect(output).deep.eq(input);
    expect(output).not.eq(input);
  });

  it('should work for `null` and `undefined`', () => {
    expect(deepFreeze(null)).eq(null);
    expect(deepFreeze(undefined)).eq(undefined);
  });

  it('should work for primitives', () => {
    const s = Symbol();
    expect(deepFreeze(42)).eq(42);
    expect(deepFreeze('foo')).eq('foo');
    expect(deepFreeze(s)).eq(s);
    expect(deepFreeze(true)).eq(true);
  });

  it('should deeply freeze objects', () => {
    const input = {
      foo: {
        bar: {
          baz: 'qux',
        },
      },
    };
    const output = deepFreeze(input);
    expect(output).deep.eq(input);
    expect(output).frozen;
    expect(output.foo).frozen;
    expect(output.foo.bar).frozen;
  });

  it('should work for Arrays', () => {
    const one = {
      foo: 'bar',
    };
    const two = {
      baz: 42,
    };
    const input = [one, two];
    const output = deepFreeze(input);
    expect(output).frozen;
    expect(output).instanceOf(Array);
    expect(output).lengthOf(2);
    expect(output).deep.eq(input);
    expect(input).not.frozen;
    expect(one).not.frozen;
    expect(two).not.frozen;
    for (const v of output) {
      expect(v).frozen;
    }
  });

  it('should work for Maps', () => {
    const key = {
      foo: 'bar',
    };
    const value = {
      baz: 42,
    };
    const input = new Map([[key, value]]);
    const output = deepFreeze(input);
    expect(output).frozen;
    expect(output).lengthOf(1);
    expect(output).deep.eq(input);
    expect(input).not.frozen;
    expect(key).not.frozen;
    expect(value).not.frozen;
    for (const [k, v] of output.entries()) {
      expect(k).frozen;
      expect(v).frozen;
    }
  });

  it('should work for Sets', () => {
    const value = {
      foo: 'bar',
    };
    const input = new Set([value]);
    const output = deepFreeze(input);
    expect(output).frozen;
    expect(output).lengthOf(1);
    expect(output).deep.eq(input);
    expect(input).not.frozen;
    expect(value).not.frozen;
    for (const v of output.values()) {
      expect(v).frozen;
    }
  });
});
