import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ObjectLiteralMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ObjectLiteralMutator', () => {
    it('should have name "ObjectLiteral"', () => {
      expect(name).eq('ObjectLiteral');
    });

    it('should empty an object declaration and then mutate it as a null value', () => {
      expectMutation('const o = { foo: "bar" }', 'const o = {}', 'const o = null');
    });

    it('should empty an object declaration of all properties and then mutate it as a null value', () => {
      expectMutation('const o = { foo: "bar", baz: "qux" }', 'const o = {}', 'const o = null');
    });

    it('should empty string object keys and then mutate it as a null value', () => {
      expectMutation('const o = { ["foo"]: "bar" }', 'const o = {}', 'const o = null');
    });

    it('shoud only mutate an empty object declaration as a null value', () => {
      expectMutation('const o = {}', 'const o = null');
    });
  });
}
