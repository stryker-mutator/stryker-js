import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function UnaryOperatorMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('UnaryOperatorMutator', () => {
    it('should have name "UnaryOperator"', () => {
      expect(name).eq('UnaryOperator');
    });

    it('should mutate -a to +a', () => {
      expectMutation('-a', '+a');
    });

    it('should mutate +a to -a', () => {
      expectMutation('+a', '-a');
    });

    it('should mutate ~a to a', () => {
      expectMutation('~a', 'a');
    });

    it('should not mutate a+a', () => {
      expectMutation('a+a');
    });

    it('should not mutate a-a', () => {
      expectMutation('a-a');
    });
  });
}
