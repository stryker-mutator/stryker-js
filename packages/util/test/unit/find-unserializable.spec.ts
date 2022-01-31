import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { findUnserializables } from '../../src/index.js';

describe(findUnserializables.name, () => {
  [4, true, undefined, null, 'str', {}, []].forEach((serializableValue) => {
    it(`should mark ${serializableValue === undefined ? 'undefined' : JSON.stringify(serializableValue)} as serializable`, () => {
      expect(findUnserializables(serializableValue)).undefined;
    });
  });

  it('should mark plain object without a prototype as serializable', () => {
    expect(findUnserializables(Object.create(null))).undefined;
  });

  [Symbol('symbol'), BigInt(42), it].forEach((unserializableValue) => {
    it(`should mark primitive type ${typeof unserializableValue} as unserializable`, () => {
      expect(findUnserializables(unserializableValue)).ok;
    });
  });

  [NaN, Infinity, -Infinity].forEach((unserializableNumber) => {
    it(`should mark number value ${unserializableNumber} as unserializable`, () => {
      expect(findUnserializables(unserializableNumber)).ok;
    });
  });

  it('should mark class instances as unserializable', () => {
    class Person {}
    expect(findUnserializables(new Person())).ok;
  });

  it('should mark the default stryker options as "serializable"', () => {
    expect(findUnserializables(testInjector.options)).undefined;
  });

  describe('path', () => {
    it('should be provided in a shallow object', () => {
      expect(findUnserializables({ symbol: Symbol(42) })?.[0].path).deep.eq(['symbol']);
    });

    it('should be provided in a deep object', () => {
      expect(findUnserializables({ obj: { symbol: Symbol(42) } })?.[0].path).deep.eq(['obj', 'symbol']);
    });

    it('should be provided in a shallow array', () => {
      expect(findUnserializables([Symbol(42)])?.[0].path).deep.eq(['0']);
    });
    it('should be provided in a deep array', () => {
      expect(findUnserializables(['a', [Symbol(42)]])?.[0].path).deep.eq(['1', '0']);
    });
  });

  describe('reason', () => {
    it('should be provided for an unserializable primitive value', () => {
      expect(findUnserializables(BigInt(42))?.[0].reason).eq('Primitive type "bigint" has no JSON representation');
    });
    it('should be provided for a class instance', () => {
      expect(findUnserializables(new (class Person {})())?.[0].reason).eq(
        'Value is an instance of "Person", this detail will get lost in translation during serialization'
      );
    });
    it('should be provided for an anonymous class instance', () => {
      expect(findUnserializables(new (class {})())?.[0].reason).eq(
        'Value is an instance of "<anonymous class>", this detail will get lost in translation during serialization'
      );
    });
    it('should be provided for a RegExp', () => {
      expect(findUnserializables(/regex/)?.[0].reason).eq(
        'Value is an instance of "RegExp", this detail will get lost in translation during serialization'
      );
    });
    it('should be provided for a Date', () => {
      expect(findUnserializables(new Date(2010, 1, 1))?.[0].reason).eq(
        'Value is an instance of "Date", this detail will get lost in translation during serialization'
      );
    });
    it('should be provided for unserializable numbers', () => {
      expect(findUnserializables(NaN)?.[0].reason).eq('Number value `NaN` has no JSON representation');
    });
  });
});
