import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function DoStatementMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('DoStatementMutator', () => {
    beforeEach(() => {
      console.warn('DEPRECATED: please migrate from the DoStatementMutatorSpec to the ConditionalExpressionMutatorSpec');
    });

    it('should have name "DoStatement"', () => {
      expect(name).eq('DoStatement');
    });

    it('should mutate the expression of a do statement', () => {
      expectMutation('do { console.log(); } while(a < b);', 'do { console.log(); } while(false);');
    });
  });
}
