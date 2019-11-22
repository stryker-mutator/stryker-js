import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ObjectLiteralMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ObjectLiteralMutator', () => {
    it('should have name "ObjectLiteral"', () => {
      expect(name).eq('ObjectLiteral');
    });

    it('should empty an object declaration', () => {
      expectMutation('const o = { foo: "bar" }', 'const o = {}');
    });

    it('should empty an object declaration of all properties', () => {
      expectMutation('const o = { foo: "bar", baz: "qux" }', 'const o = {}');
    });

    it('should empty string object keys', () => {
      expectMutation('const o = { ["foo"]: "bar" }', 'const o = {}');
    });

    it('shoud not mutate empty object declarations', () => {
      expectMutation('const o = {}');
    });
  });
}
