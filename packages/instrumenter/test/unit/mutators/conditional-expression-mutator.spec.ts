import { expect } from 'chai';

import { expectJSMutation } from '../../helpers/expect-mutation.js';
import { conditionalExpressionMutator as sut } from '../../../src/mutators/conditional-expression-mutator.js';

describe(sut.name, () => {
  it('should have name "ConditionalExpression"', () => {
    expect(sut.name).eq('ConditionalExpression');
  });

  it('should mutate ternary operator', () => {
    expectJSMutation(
      sut,
      'a < 3? b : c',
      { isExpressionContext: false },
      'false? b : c',
      'true? b : c',
    );
  });

  it('should mutate < and >', () => {
    expectJSMutation(
      sut,
      'a < b',
      { isExpressionContext: false },
      'true',
      'false',
    );
    expectJSMutation(
      sut,
      'a > b',
      { isExpressionContext: false },
      'true',
      'false',
    );
  });

  it('should mutate <= and >=', () => {
    expectJSMutation(
      sut,
      'a <= b',
      { isExpressionContext: false },
      'true',
      'false',
    );
    expectJSMutation(
      sut,
      'a >= b',
      { isExpressionContext: false },
      'true',
      'false',
    );
  });

  it('should mutate == and ===', () => {
    expectJSMutation(
      sut,
      'a == b',
      { isExpressionContext: false },
      'true',
      'false',
    );
    expectJSMutation(
      sut,
      'a === b',
      { isExpressionContext: false },
      'true',
      'false',
    );
  });

  it('should mutate != and !==', () => {
    expectJSMutation(
      sut,
      'a != b',
      { isExpressionContext: false },
      'true',
      'false',
    );
    expectJSMutation(
      sut,
      'a !== b',
      { isExpressionContext: false },
      'true',
      'false',
    );
  });

  it('should mutate && and ||', () => {
    expectJSMutation(
      sut,
      'a && b',
      { isExpressionContext: false },
      'true',
      'false',
    );
    expectJSMutation(
      sut,
      'a || b',
      { isExpressionContext: false },
      'true',
      'false',
    );
  });

  it('should not mutate + and -', () => {
    expectJSMutation(sut, 'a + b', { isExpressionContext: false });
    expectJSMutation(sut, 'a - b', { isExpressionContext: false });
  });

  it('should not mutate *, % and /', () => {
    expectJSMutation(sut, 'a * b', { isExpressionContext: false });
    expectJSMutation(sut, 'a / b', { isExpressionContext: false });
    expectJSMutation(sut, 'a % b', { isExpressionContext: false });
  });

  it('should not mutate assignments', () => {
    expectJSMutation(sut, 'let displayName; displayName = "Label";', {
      isExpressionContext: false,
    });
  });

  it('should mutate the expression of a do statement', () => {
    expectJSMutation(
      sut,
      'do { console.log(); } while(a < b);',
      { isExpressionContext: false },
      'do { console.log(); } while(false);',
    );
  });

  it('should mutate the condition of a for statement', () => {
    expectJSMutation(
      sut,
      'for(let i=0;i<10; i++) { console.log(); }',
      { isExpressionContext: false },
      'for(let i=0;false; i++) { console.log(); }',
    );
  });

  it('should mutate the condition of a for statement without a condition', () => {
    expectJSMutation(
      sut,
      'for(let i=0;; i++) { console.log(); }',
      { isExpressionContext: false },
      `for (let i = 0; false; i++) {
  console.log();
}`,
    );
  });

  it('should not mutate (a || b) condition to (a || true)', () => {
    expectJSMutation(
      sut,
      'if (b === 5 || c === 3) { a++ }',
      { isExpressionContext: false },
      'if (true) { a++ }',
      'if (false) { a++ }',
      'if (false || c === 3) { a++ }',
      'if (b === 5 || false) { a++ }',
    );
  });

  it('should not mutate (a && b) condition to (a && false)', () => {
    expectJSMutation(
      sut,
      'if (b === 5 && c === 3) { a++ }',
      { isExpressionContext: false },
      'if (true) { a++ }',
      'if (false) { a++ }',
      'if (true && c === 3) { a++ }',
      'if (b === 5 && true) { a++ }',
    );
  });

  it('should mutate ((c1 && c2) || (c3 && c4))', () => {
    expectJSMutation(
      sut,
      'if ((c1 && c2) || (c3 && c4)) { a++ }',
      { isExpressionContext: false },
      'if (true) { a++ }',
      'if (false) { a++ }',
      'if ((false) || (c3 && c4)) { a++ }',
      'if ((c1 && c2) || (false)) { a++ }',
    );
  });

  it('should mutate ((c1 || c2) && (c3 || c4))', () => {
    expectJSMutation(
      sut,
      'if ((c1 || c2) && (c3 || c4)) { a++ }',
      { isExpressionContext: false },
      'if (true) { a++ }',
      'if (false) { a++ }',
      'if ((true) && (c3 || c4)) { a++ }',
      'if ((c1 || c2) && (true)) { a++ }',
    );
  });

  it('should mutate an expression to `true` and `false`', () => {
    expectJSMutation(
      sut,
      'if (something) { a++ }',
      { isExpressionContext: false },
      'if (true) { a++ }',
      'if (false) { a++ }',
    );
  });

  it('should remove all cases one at a time', () => {
    expectJSMutation(
      sut,
      'switch (v) {case 0: a = "foo"; case 1: a = "qux"; break; default: a = "spam";}',
      { isExpressionContext: false },
      'switch (v) {case 0: case 1: a = "qux"; break; default: a = "spam";}',
      'switch (v) {case 0: a = "foo"; case 1: default: a = "spam";}',
      'switch (v) {case 0: a = "foo"; case 1: a = "qux"; break; default:}',
    );
  });

  it('should not mutate empty cases (0 consequent statements)', () => {
    expectJSMutation(
      sut,
      'switch (v) {case 0: case 1: break; default: a = "spam";}',
      { isExpressionContext: false },
      'switch (v) {case 0: case 1: default: a = "spam";}',
      'switch (v) {case 0: case 1: break; default:}',
    );
  });

  it('should mutate the expression of a while statement', () => {
    expectJSMutation(
      sut,
      'while(a < b) { console.log(); }',
      { isExpressionContext: false },
      'while(false) { console.log(); }',
    );
  });
});
