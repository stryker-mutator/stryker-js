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

    it('should not mutate assignments', () => {
      expectMutation('let displayName; displayName = "Label";');
    });

    it('should mutate the expression of a do statement', () => {
      expectMutation('do { console.log(); } while(a < b);', 'do { console.log(); } while(false);');
    });

    it('should mutate the condition of a for statement', () => {
      expectMutation('for(let i=0;i<10; i++) { console.log(); }', 'for(let i=0;false; i++) { console.log(); }');
    });

    it('should mutate the condition of a for statement without a condition', () => {
      expectMutation('for(let i=0;; i++) { console.log(); }', 'for (let i = 0; false; i++) { console.log(); }');
    });

    it('should mutate an expression to `true` and `false`', () => {
      expectMutation('if (something) { a++ }', 'if (true) { a++ }', 'if (false) { a++ }');
    });

    it('should remove all cases one at a time', () => {
      expectMutation(
        'switch (v) {case 0: a = "foo"; case 1: a = "qux"; break; default: a = "spam";}',
        'switch (v) {case 0: case 1: a = "qux"; break; default: a = "spam";}',
        'switch (v) {case 0: a = "foo"; case 1: default: a = "spam";}',
        'switch (v) {case 0: a = "foo"; case 1: a = "qux"; break; default:}'
      );
    });

    it('should not mutate empty cases (0 consequent statements)', () => {
      expectMutation(
        'switch (v) {case 0: case 1: break; default: a = "spam";}',
        'switch (v) {case 0: case 1: default: a = "spam";}',
        'switch (v) {case 0: case 1: break; default:}'
      );
    });

    it('should mutate the expression of a while statement', () => {
      expectMutation('while(a < b) { console.log(); }', 'while(false) { console.log(); }');
    });
  });
}
