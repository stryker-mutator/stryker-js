import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function PrefixUnaryExpressionMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('PrefixUnaryExpressionMutator', () => {
    beforeEach(() => {
      console.warn(
        'DEPRECATED: please migrate from the PrefixUnaryExpressionMutatorSpec to the UnaryOperatorMutatorSpec, UpdateOperatorMutatorSpec and BooleanLiteralMutatorSpec'
      );
    });

    it('should have name "PrefixUnaryExpression"', () => {
      expect(name).eq('PrefixUnaryExpression');
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

    it('should mutate !a to a', () => {
      expectMutation('!a', 'a');
    });

    it('should mutate ++a to --a', () => {
      expectMutation('++a', '--a');
    });

    it('should mutate --a to ++a', () => {
      expectMutation('--a', '++a');
    });

    it('should not mutate a+a', () => {
      expectMutation('a+a');
    });

    it('should not mutate a-a', () => {
      expectMutation('a-a');
    });

    it('should not mutate a++ to a--', () => {
      expectMutation('a++');
    });

    it('should not mutate a-- to a++', () => {
      expectMutation('a--');
    });
  });
}
