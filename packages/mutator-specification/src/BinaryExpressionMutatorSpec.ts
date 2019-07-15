import { expect } from 'chai';
import ExpectMutation from './ExpectMutation';

export default function binaryExpressionMutatorSpec(name: string, expectMutation: ExpectMutation) {

  describe('BinaryExpressionMutator', () => {

    it('should have name "BinaryExpression"', () => {
      expect(name).eq('BinaryExpression');
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

    it('should mutate && and ||', () => {
      expectMutation('a && b', 'a || b');
      expectMutation('a || b', 'a && b');
    });

  });
}
