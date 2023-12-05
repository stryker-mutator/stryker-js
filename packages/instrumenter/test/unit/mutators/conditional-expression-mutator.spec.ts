import { expect } from 'chai';

import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { conditionalExpressionMutator as sut } from '../../../src/mutators/conditional-expression-mutator.js';

const conditionLevel: string[] = ['ForLoopToFalse', 'IfToFalse', 'IfToTrue', 'SwitchToEmpty'];
const conditionLevel2: string[] = ['WhileLoopToFalse', 'BooleanExpressionToFalse', 'DoWhileLoopToFalse', 'BooleanExpressionToTrue'];
const conditionLevel3 = undefined;

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
}`,
    );
  });

  it('should not mutate (a || b) condition to (a || true)', () => {
    expectJSMutation(
      sut,
      'if (b === 5 || c === 3) { a++ }',
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
      'if (true) { a++ }',
      'if (false) { a++ }',
      'if ((true) && (c3 || c4)) { a++ }',
      'if ((c1 || c2) && (true)) { a++ }',
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
      'switch (v) {case 0: a = "foo"; case 1: a = "qux"; break; default:}',
    );
  });

  it('should not mutate empty cases (0 consequent statements)', () => {
    expectJSMutation(
      sut,
      'switch (v) {case 0: case 1: break; default: a = "spam";}',
      'switch (v) {case 0: case 1: default: a = "spam";}',
      'switch (v) {case 0: case 1: break; default:}',
    );
  });

  it('should mutate the expression of a while statement', () => {
    expectJSMutation(sut, 'while(a < b) { console.log(); }', 'while(false) { console.log(); }');
  });

  it('should only mutate for, if and switch statement', () => {
    expectJSMutationWithLevel(
      sut,
      conditionLevel,
      'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}',
      'for (var i = 0; false; i++) { };if(x > 2); switch (x) {case 0: 2}', // mutates for loop
      'for (var i = 0; i < 10; i++) { };if(false); switch (x) {case 0: 2}', // mutates if statement to false
      'for (var i = 0; i < 10; i++) { };if(true); switch (x) {case 0: 2}', // mutates if statement to true
      'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0:}', // mutates switch statement
    );
  });

  it('should only mutate while, while do and boolean expression', () => {
    expectJSMutationWithLevel(
      sut,
      conditionLevel2,
      'while (a > b) { }; do { } while (a > b); var x = a > b ? 1 : 2',
      'while (false) { }; do { } while (a > b); var x = a > b ? 1 : 2', // mutates while loop
      'while (a > b) { }; do { } while (a > b); var x = false ? 1 : 2', // mutates boolean to false
      'while (a > b) { }; do { } while (false); var x = a > b ? 1 : 2', // mutates while do loop
      'while (a > b) { }; do { } while (a > b); var x = true ? 1 : 2', // mutates boolean to false
    );
  });

  it('should only mutate all', () => {
    expectJSMutationWithLevel(
      sut,
      conditionLevel3,
      'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2',
      'for (var i = 0; false; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates for loop
      'for (var i = 0; i < 10; i++) { };if(false); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates if statement to false
      'for (var i = 0; i < 10; i++) { };if(true); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates if statement to true
      'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0:}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates switch statement
      'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (false); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates while loop
      'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = false ? 1 : 2', // mutates boolean to false
      'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (false); var x = a > b ? 1 : 2', // mutates while do loop
      'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = true ? 1 : 2', // mutates boolean to false
    );
  });
});
