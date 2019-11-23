import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function EqualityOperatorMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('EqualityOperatorMutator', () => {
    it('should have name "EqualityOperator"', () => {
      expect(name).eq('EqualityOperator');
    });

    it('should mutate < and >', () => {
      expectMutation('a < b', 'a >= b', 'a <= b');
      expectMutation('a > b', 'a <= b', 'a >= b');
    });

    it('should mutate <= and >=', () => {
      expectMutation('a <= b', 'a < b', 'a > b');
      expectMutation('a >= b', 'a < b', 'a > b');
    });

    it('should mutate == and ===', () => {
      expectMutation('a == b', 'a != b');
      expectMutation('a === b', 'a !== b');
    });

    it('should mutate != and !==', () => {
      expectMutation('a != b', 'a == b');
      expectMutation('a !== b', 'a === b');
    });
  });
}
