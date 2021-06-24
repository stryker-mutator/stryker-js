import { expect } from 'chai';

import { expectJSMutation } from '../../helpers/expect-mutation';
import { conditionalExpressionMutator as sut } from '../../../src/mutators/conditional-expression-mutator';

describe(sut.name, () => {
  it('should have name "ConditionalExpression"', () => {
    expect(sut.name).eq('ConditionalExpression');
  });

  it('should mutate ternary operator', () => {
    expectJSMutation(sut, 'a < 3? b : c', 'false? b : c', 'true? b : c');
  });

  it('should mutate < and >', () => {
    expectJSMutation(sut, 'a < b', 'true', 'false');
    expectJSMutation(sut, 'a > b', 'true', 'false');
  });

  it('should mutate <= and >=', () => {
    expectJSMutation(sut, 'a <= b', 'true', 'false');
    expectJSMutation(sut, 'a >= b', 'true', 'false');
  });

  it('should mutate == and ===', () => {
    expectJSMutation(sut, 'a == b', 'true', 'false');
    expectJSMutation(sut, 'a === b', 'true', 'false');
  });

  it('should mutate != and !==', () => {
    expectJSMutation(sut, 'a != b', 'true', 'false');
    expectJSMutation(sut, 'a !== b', 'true', 'false');
  });

  it('should mutate && and ||', () => {
    expectJSMutation(sut, 'a && b', 'true', 'false');
    expectJSMutation(sut, 'a || b', 'true', 'false');
  });

  it('should not mutate + and -', () => {
    expectJSMutation(sut, 'a + b');
    expectJSMutation(sut, 'a - b');
  });

  it('should not mutate *, % and /', () => {
    expectJSMutation(sut, 'a * b');
    expectJSMutation(sut, 'a / b');
    expectJSMutation(sut, 'a % b');
  });

  it('should not mutate assignments', () => {
    expectJSMutation(sut, 'let displayName; displayName = "Label";');
  });

  it('should mutate the expression of a do statement', () => {
    expectJSMutation(sut, 'do { console.log(); } while(a < b);', 'do { console.log(); } while(false);');
  });

  it('should mutate the condition of a for statement', () => {
    expectJSMutation(sut, 'for(let i=0;i<10; i++) { console.log(); }', 'for(let i=0;false; i++) { console.log(); }');
  });

  it('should mutate the condition of a for statement without a condition', () => {
    expectJSMutation(
      sut,
      'for(let i=0;; i++) { console.log(); }',
      `for (let i = 0; false; i++) {
  console.log();
}`
    );
  });

  it('should mutate an expression to `true` and `false`', () => {
    expectJSMutation(sut, 'if (something) { a++ }', 'if (true) { a++ }', 'if (false) { a++ }');
  });

  it('should remove all cases one at a time', () => {
    expectJSMutation(
      sut,
      'switch (v) {case 0: a = "foo"; case 1: a = "qux"; break; default: a = "spam";}',
      'switch (v) {case 0: case 1: a = "qux"; break; default: a = "spam";}',
      'switch (v) {case 0: a = "foo"; case 1: default: a = "spam";}',
      'switch (v) {case 0: a = "foo"; case 1: a = "qux"; break; default:}'
    );
  });

  it('should not mutate empty cases (0 consequent statements)', () => {
    expectJSMutation(
      sut,
      'switch (v) {case 0: case 1: break; default: a = "spam";}',
      'switch (v) {case 0: case 1: default: a = "spam";}',
      'switch (v) {case 0: case 1: break; default:}'
    );
  });

  it('should mutate the expression of a while statement', () => {
    expectJSMutation(sut, 'while(a < b) { console.log(); }', 'while(false) { console.log(); }');
  });
});
