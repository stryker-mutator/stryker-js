import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ForStatementMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ForStatementMutator', () => {
    beforeEach(() => {
      console.warn('DEPRECATED: please migrate from the ForStatementMutatorSpec to the ConditionalExpressionMutatorSpec');
    });

    it('should have name "ForStatement"', () => {
      expect(name).eq('ForStatement');
    });

    it('should mutate the condition of a for statement', () => {
      expectMutation('for(let i=0;i<10; i++) { console.log(); }', 'for(let i=0;false; i++) { console.log(); }');
    });

    it('should mutate the condition of a for statement without a condition', () => {
      expectMutation('for(let i=0;; i++) { console.log(); }', 'for (let i = 0; false; i++) { console.log(); }');
    });
  });
}
