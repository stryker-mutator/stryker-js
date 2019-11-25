import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function NumericValueMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('NumericValueMutator', () => {
    it('should have name "NumericValue"', () => {
      expect(name).eq('NumericValue');
    });

    it('should mutate a positive numeric literal 123.4567', () => {
      expectMutation(
        // input code:
        'const a = 123.4567;',
        // expected mutations:
        'const a = 0;',
        'const a = 1;',
        'const a = -1;',
        'const a = Infinity;',
        'const a = -Infinity;',
        'const a = NaN;',
        'const a = 124.4567;',
        'const a = 122.4567;'
      );
    });

    it('should mutate a negative numeric literal -123.4567', () => {
      expectMutation(
        // input code:
        'const a = -123.4567;',
        // expected mutations:
        'const a = 0;',
        'const a = 1;',
        'const a = -1;',
        'const a = Infinity;',
        'const a = -Infinity;',
        'const a = NaN;',
        'const a = -122.4567;',
        'const a = -124.4567;'
      );
    });

    it('should not generate extra mutation for numeric literal 0', () => {
      expectMutation(
        // input code:
        'const a = 0;',
        // expected mutations:
        'const a = 1;',
        'const a = -1;',
        'const a = Infinity;',
        'const a = -Infinity;',
        'const a = NaN;'
      );
    });

    it('should not generate extra mutation for numeric literal 1', () => {
      expectMutation(
        // input code:
        'const a = 1;',
        // expected mutations:
        'const a = 0;',
        'const a = -1;',
        'const a = Infinity;',
        'const a = -Infinity;',
        'const a = NaN;',
        'const a = 2;'
      );
    });

    it('should not generate extra mutation for numeric literal -1', () => {
      expectMutation(
        // input code:
        'const a = -1;',
        // expected mutations:
        'const a = 0;',
        'const a = 1;',
        'const a = Infinity;',
        'const a = -Infinity;',
        'const a = NaN;',
        'const a = -2;'
      );
    });

    it('should not generate extra mutation for numeric literal -0', () => {
      expectMutation(
        // input code:
        'const a = -0;',
        // expected mutations:
        'const a = 1;',
        'const a = -1;',
        'const a = Infinity;',
        'const a = -Infinity;',
        'const a = NaN;'
      );
    });

    it('should not generate extra mutation for numeric literal value Infinity', () => {
      expectMutation(
        // input code:
        'const a = Infinity;',
        // expected mutations:
        'const a = 0;',
        'const a = 1;',
        'const a = -1;',
        'const a = -Infinity;',
        'const a = NaN;'
      );
    });

    it('should not generate extra mutation for numeric literal value -Infinity', () => {
      expectMutation(
        // input code:
        'const a = -Infinity;',
        // expected mutations:
        'const a = 0;',
        'const a = 1;',
        'const a = -1;',
        'const a = Infinity;',
        'const a = NaN;'
      );
    });

    it('should not generate extra NaN mutation for numeric literal value NaN', () => {
      expectMutation(
        // input code:
        'const a = -NaN;',
        // expected mutations:
        'const a = 0;',
        'const a = 1;',
        'const a = -1;',
        'const a = Infinity;',
        'const a = -Infinity;'
      );
    });

    it('should not generate extra NaN mutation for numeric literal value -NaN', () => {
      expectMutation(
        // input code:
        'const a = -NaN;',
        // expected mutations:
        'const a = 0;',
        'const a = 1;',
        'const a = -1;',
        'const a = Infinity;',
        'const a = -Infinity;'
      );
    });

    it('should not mutate type declarations', () => {
      expectMutation('let a: Record<"id", 123>;');
      expectMutation('let a: 123;');
    });
  });
}
