import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function IfStatementMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('IfStatementMutator', () => {
    it('should have name "IfStatement"', () => {
      expect(name).eq('IfStatement');
    });

    it('should mutate an expression to `true` and `false`', () => {
      expectMutation('if (something) { a++ }', 'if (true) { a++ }', 'if (false) { a++ }');
    });
  });
}
