import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function WhileStatementMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('WhileStatementMutator', () => {
    beforeEach(() => {
      console.warn('DEPRECATED: please migrate from the WhileStatementMutatorSpec to the ConditionalExpressionMutatorSpec');
    });

    it('should have name "WhileStatement"', () => {
      expect(name).eq('WhileStatement');
    });

    it('should mutate the expression of a while statement', () => {
      expectMutation('while(a < b) { console.log(); }', 'while(false) { console.log(); }');
    });
  });
}
