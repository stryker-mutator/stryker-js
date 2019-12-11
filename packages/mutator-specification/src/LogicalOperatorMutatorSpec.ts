import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function LogicalOperatorMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('LogicalOperatorMutator', () => {
    it('should have name "LogicalOperator"', () => {
      expect(name).eq('LogicalOperator');
    });

    it('should mutate && and ||', () => {
      expectMutation('a && b', 'a || b');
      expectMutation('a || b', 'a && b');
    });
  });
}
