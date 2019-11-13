import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function BooleanSubstitutionMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('BooleanSubstitutionMutator', () => {
    it('should have name "BooleanSubstitution"', () => {
      expect(name).eq('BooleanSubstitution');
    });

    it('should mutate `true` into `false`', () => {
      expectMutation('true', 'false');
    });

    it('should mutate `false` into `true`', () => {
      expectMutation('false', 'true');
    });
  });
}
