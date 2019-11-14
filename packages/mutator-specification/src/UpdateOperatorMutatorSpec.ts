import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function UpdateOperatorMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('UpdateOperatorMutator', () => {
    it('should have name "UpdateOperator"', () => {
      expect(name).eq('UpdateOperator');
    });

    it('should mutate a++ to a--', () => {
      expectMutation('a++', 'a--');
    });

    it('should mutate a-- to a++', () => {
      expectMutation('a--', 'a++');
    });

    it('should mutate ++a to --a', () => {
      expectMutation('++a', '--a');
    });

    it('should mutate --a to ++a', () => {
      expectMutation('--a', '++a');
    });
  });
}
