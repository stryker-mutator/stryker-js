import { expect } from 'chai';

import { normalizeWhitespaces, propertyPath, escapeRegExpLiteral, escapeRegExp } from '../../src/index.js';

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

  describe(propertyPath.name, () => {
    interface Foo {
      bar: string;
      [name: string]: string;
    }
    interface Bar {
      bar: {
        baz: string;
      };
      qux: {
        [name: string]: string;
        quux: string;
      };
    }
    interface Baz {
      flags:
        | false
        | {
            f1: boolean;
            f2:
              | false
              | {
                  f3: boolean;
                };
          };
    }

    it('should be able to point to a path of lenght 1', () => {
      expect(propertyPath<Foo>()('bar')).eq('bar');
    });

    it('should not be able to point to a non-existing path of length 1', () => {
      // @ts-expect-error Argument of type '"baz"' is not assignable to parameter of type '"bar"'.ts(2345)
      propertyPath<Foo>()('baz');
    });

    it('should be able to point to a path of length 2', () => {
      expect(propertyPath<Bar>()('bar', 'baz')).eq('bar.baz');
    });

    it('should not be able to point to a path non-existing path of length 2', () => {
      // @ts-expect-error Argument of type '"bar"' is not assignable to parameter of type '"quux"'.ts(2345)
      propertyPath<Bar>()('qux', 'bar');
    });

    it('should be able to point to a path of a union type', () => {
      expect(propertyPath<Baz>()('flags', 'f1')).eq('flags.f1');
      expect(propertyPath<Baz>()('flags', 'f2', 'f3')).eq('flags.f2.f3');
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
