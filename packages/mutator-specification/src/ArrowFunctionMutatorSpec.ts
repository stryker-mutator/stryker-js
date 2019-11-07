import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function ArrowFunctionMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ArrowFunctionMutator', () => {
    it('should have name "ArrowFunction"', () => {
      expect(name).eq('ArrowFunction');
    });

    it('should mutate an anonymous function with an inline return', () => {
      expectMutation('const b = () => 4;', 'const b = () => undefined;');
    });

    it('should not mutate an anonymous function with a block as a body', () => {
      expectMutation('const b = () => { return 4; }');
    });
  });
}
