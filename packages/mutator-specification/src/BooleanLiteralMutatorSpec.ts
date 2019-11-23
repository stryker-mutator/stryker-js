import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function BooleanLiteralMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('BooleanLiteralMutator', () => {
    it('should have name "BooleanLiteral"', () => {
      expect(name).eq('BooleanLiteral');
    });

    it('should mutate `true` into `false`', () => {
      expectMutation('true', 'false');
    });

    it('should mutate `false` into `true`', () => {
      expectMutation('false', 'true');
    });

    it('should mutate !a to a', () => {
      expectMutation('!a', 'a');
    });
  });
}
