import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ArrayNewExpressionMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ArrayNewExpressionMutator', () => {
    it('should have name "ArrayNewExpression"', () => {
      expect(name).eq('ArrayNewExpression');
    });

    it('should mutate filled array literals as empty arrays', () => {
      expectMutation('new Array(a, 1 + 1)', 'new Array()');
      expectMutation("new Array('val')", 'new Array()');
    });

    it('should not mutate array literals (leave that for ArrayLiteralMutator)', () => {
      expectMutation('[]');
      expectMutation('[1, 2 ,3]');
    });

    it('should not mutate other new expressions', () => {
      expectMutation('new Object(21, 2)');
      expectMutation('new Arrays(21, 2)');
    });

    it('should mutate empty array literals as a filled array', () => {
      expectMutation('new Array()', 'new Array([])');
    });
  });
}
