import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function ObjectMutatorSpec(
  name: string,
  expectMutation: ExpectMutation
) {
  describe('ObjectMutator', () => {
    it('should have name "Object"', () => {
      expect(name).eq('Object');
    });

    it('should empty an object declaration', () => {
      expectMutation('const o = { foo: "bar" }', 'const o = {}');
    });

    it('shoud not mutate empty object declarations', () => {
      expectMutation('const o = {}');
    });
  });
}
