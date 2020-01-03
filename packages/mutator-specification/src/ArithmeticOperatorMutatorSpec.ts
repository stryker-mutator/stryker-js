import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ArithmeticOperatorMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ArithmeticOperatorMutator', () => {
    it('should have name "ArithmeticOperator"', () => {
      expect(name).eq('ArithmeticOperator');
    });

    it('should mutate + and -', () => {
      expectMutation('a + b', 'a - b');
      expectMutation('a - b', 'a + b');
    });

    it('should mutate *, % and /', () => {
      expectMutation('a * b', 'a / b');
      expectMutation('a / b', 'a * b');
      expectMutation('a % b', 'a * b');
    });
  });
}
