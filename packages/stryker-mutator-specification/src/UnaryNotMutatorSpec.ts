import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function UnaryNotMutatorSpec(name: string, expectMutation: ExpectMutation) {

  describe('UnaryNotMutator', () => {

    it('should have name "UnaryNot"', () => {
      expect(name).eq('UnaryNot');
    });

    it('should mutate `!a` into `a`', () => {
      expectMutation('!a', 'a');
    });

  });
}