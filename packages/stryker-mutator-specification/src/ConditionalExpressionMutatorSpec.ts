import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function ConditionalExpressionMutatorSpec(name: string, expectMutation: ExpectMutation) {

  describe('ConditionalExpressionMutator', () => {

    it('should have name "ConditionalExpression"', () => {
      expect(name).eq('ConditionalExpression');
    });

    it('should replace conditional expressions', () => {
      expectMutation('a < 3? b : c', 'false? b : c', 'true? b : c');
    });
  });
}