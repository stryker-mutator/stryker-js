import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ObjectShorthandPropertyMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ObjectShorthandPropertyMutator', () => {
    it('should have name "ObjectShorthandProperty"', () => {
      expect(name).eq('ObjectShorthandProperty');
    });

    it('should mutate a single object shorthand property', () => {
      expectMutation('const o = { bar }', 'const o = {}');
    });

    it('should mutate multiple object shorthand properties', () => {
      expectMutation('const o = { bar, baz }', 'const o = { baz }', 'const o = { bar }');
    });

    it('should only mutate an object shorthand property', () => {
      expectMutation('const o = { bar, baz: "qux" }', 'const o = { baz: "qux" }');
    });

    it('shoud not mutate empty object declarations', () => {
      expectMutation('const o = {}');
    });
  });
}
