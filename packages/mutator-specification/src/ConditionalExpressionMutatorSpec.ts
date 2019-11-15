import { expect } from 'chai';

import ExpectMutation from './ExpectMutation';

export default function ConditionalExpressionMutatorSpec(name: string, expectMutation: ExpectMutation) {
  describe('ConditionalExpressionMutator', () => {
    it('should have name "ConditionalExpression"', () => {
      expect(name).eq('ConditionalExpression');
    });

    it('should mutate ternary operator', () => {
      expectMutation('a < 3? b : c', 'false? b : c', 'true? b : c');
    });

    it('should mutate < and >', () => {
      expectMutation('a < b', 'true', 'false');
      expectMutation('a > b', 'true', 'false');
    });

    it('should mutate <= and >=', () => {
      expectMutation('a <= b', 'true', 'false');
      expectMutation('a >= b', 'true', 'false');
    });

    it('should mutate == and ===', () => {
      expectMutation('a == b', 'true', 'false');
      expectMutation('a === b', 'true', 'false');
    });

    it('should mutate != and !==', () => {
      expectMutation('a != b', 'true', 'false');
      expectMutation('a !== b', 'true', 'false');
    });

    it('should mutate && and ||', () => {
      expectMutation('a && b', 'true', 'false');
      expectMutation('a || b', 'true', 'false');
    });

    it('should not mutate + and -', () => {
      expectMutation('a + b');
      expectMutation('a - b');
    });

    it('should not mutate *, % and /', () => {
      expectMutation('a * b');
      expectMutation('a / b');
      expectMutation('a % b');
    });

    it('should not mutate `if statement`', () => {
      expectMutation('if (a < 6) { a++ }');
    });

    it('should not mutate `for statement`', () => {
      expectMutation('for(let i=0;i<10; i++) { console.log(); }');
    });

    it('should not mutate `while statement`', () => {
      expectMutation('while(a < b) { console.log(); }');
    });

    it('should not mutate `do while statement`', () => {
      expectMutation('do { console.log(); } while(a < b);');
    });
  });
}
