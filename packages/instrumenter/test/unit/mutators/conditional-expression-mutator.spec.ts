import { expect } from 'chai';

import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { conditionalExpressionMutator as sut } from '../../../src/mutators/conditional-expression-mutator.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const conditionalLevel: MutationLevel = {
  name: 'ConditionalLevel',
  ConditionalExpression: [
    'ForLoopConditionToFalseReplacement',
    'IfConditionToFalseReplacement',
    'IfConditionToTrueReplacement',
    'SwitchStatementBodyRemoval',
  ],
};

const booleanExpressionLevel: MutationLevel = {
  name: 'ConditionalLevel',
  ConditionalExpression: ['BooleanExpressionToFalseReplacement', 'BooleanExpressionToTrueReplacement'],
};

const conditionalUndefinedLevel: MutationLevel = {
  name: 'ConditionLevelEmpty',
  ConditionalExpression: [],
};

const noLevel = undefined;

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

  describe('mutation level', () => {
    it('should only mutate for, if and switch statement', () => {
      expectJSMutationWithLevel(
        sut,
        conditionalLevel.ConditionalExpression,
        'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2',
        'for (var i = 0; false; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates for loop
        'for (var i = 0; i < 10; i++) { };if(false); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates if statement to false
        'for (var i = 0; i < 10; i++) { };if(true); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates if statement to true
        'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0:}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates switch statement
      );
    });

    it('should only mutate && boolean expressions', () => {
      expectJSMutationWithLevel(
        sut,
        booleanExpressionLevel.ConditionalExpression,
        'if (true) { }; for(let i=0;; i++) { }; if ((c1 && c2) || (c3 && c4)) { } ',
        'if (true) { }; for(let i=0;; i++) { }; if ((c1 && c2) || (false)) { } ', // mutates c3 && c4 to false
        'if (true) { }; for(let i=0;; i++) { }; if ((false) || (c3 && c4)) { } ', // mutates c1 && c2 to false
      );
    });

    it('should only mutate || boolean expressions', () => {
      expectJSMutationWithLevel(
        sut,
        booleanExpressionLevel.ConditionalExpression,
        'if (true) { }; for(let i=0;; i++) { }; if ((c1 || c2) && (c3 || c4)) { } ',
        'if (true) { }; for(let i=0;; i++) { }; if ((c1 || c2) && (true)) { } ', // mutates c3 || c4 to true
        'if (true) { }; for(let i=0;; i++) { }; if ((true) && (c3 || c4)) { } ', // mutates c1 || c2 to true
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        conditionalUndefinedLevel.ConditionalExpression,
        'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2',
      );
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2',
        'for (var i = 0; false; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates for loop
        'for (var i = 0; i < 10; i++) { };if(false); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates if statement to false
        'for (var i = 0; i < 10; i++) { };if(true); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates if statement to true
        'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0:}; while (a > b); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates switch statement
        'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (false); { } do { } while (a > b); var x = a > b ? 1 : 2', // mutates while loop
        'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = false ? 1 : 2', // mutates boolean expression to false
        'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (false); var x = a > b ? 1 : 2', // mutates do while loop
        'for (var i = 0; i < 10; i++) { };if(x > 2); switch (x) {case 0: 2}; while (a > b); { } do { } while (a > b); var x = true ? 1 : 2', // mutates boolean expression to true
      );
    });
  });
});
