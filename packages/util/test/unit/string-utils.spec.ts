import { expect } from 'chai';

import { normalizeWhitespaces, propertyPath, escapeRegExpLiteral, escapeRegExp, PropertyPathBuilder } from '../../src';

describe('stringUtils', () => {
  describe(normalizeWhitespaces.name, () => {
    it('should not change strings without consecutive whitespaces', () => {
      expect(normalizeWhitespaces('foo bar baz')).eq('foo bar baz');
    });

    it('should normalize a string with multiple consecutive spaces', () => {
      expect(normalizeWhitespaces('foo  bar   baz')).eq('foo bar baz');
    });

    it('should normalize a string with multiple consecutive spaces, tabs and new lines', () => {
      expect(normalizeWhitespaces('foo \t \n bar\n\tbaz')).eq('foo bar baz');
    });
  });

  describe(PropertyPathBuilder.name, () => {
    interface Foo {
      bar: {
        baz: string;
      };
      qux: {
        [name: string]: string;
        quux: string;
      };
    }

    it('should be able to point to a path', () => {
      const path = PropertyPathBuilder.create<Foo>().prop('bar').prop('baz');
      expect(path.build()).eq('bar.baz');
      expect(path.toString()).eq('bar.baz');
    });

    it('should not be able to point to a path non-existing path', () => {
      // @ts-expect-error Argument of type '"bar"' is not assignable to parameter of type '"quux"'.ts(2345)
      PropertyPathBuilder.create<Foo>().prop('qux').prop('bar');
    });
  });

  describe(propertyPath.name, () => {
    interface Foo {
      bar: string;
      [name: string]: string;
    }

    it('should be able to point to a path', () => {
      expect(propertyPath<Foo>('bar')).eq('bar');
    });

    it('should not be able to point to a non-existing path', () => {
      // @ts-expect-error Argument of type '"baz"' is not assignable to parameter of type '"bar"'.ts(2345)
      propertyPath<Foo>('baz');
    });
  });

  describe(escapeRegExpLiteral.name, () => {
    it('should return input if no special chars are found', () => {
      expect(escapeRegExpLiteral('something normal')).eq('something normal');
    });

    for (const letter of '.*+-?^${}()|[]\\/') {
      it(`should escape "${letter}"`, () => {
        expect(escapeRegExpLiteral(letter)).eq(`\\${letter}`);
      });
    }
  });

  describe(escapeRegExp.name, () => {
    it('should return input if no special chars are found', () => {
      expect(escapeRegExp('something normal')).eq('something normal');
    });

    it("should not escape `/` (that's only needed for regex literals)", () => {
      expect(escapeRegExp('n/a')).eq('n/a');
    });

    for (const letter of '.*+-?^${}()|[]\\') {
      it(`should escape "${letter}"`, () => {
        expect(escapeRegExp(letter)).eq(`\\${letter}`);
      });
    }
  });
});
