import { expect } from 'chai';

import { arithmeticOperatorMutator as sut } from '../../../src/mutators/arithmetic-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const arithmeticLevel: MutationLevel = { name: 'ArithemticLevel', ArithmeticOperator: ['+To-', '-To+', '*To/'] };

describe(sut.name, () => {
  it('should have name "ArithmeticOperator"', () => {
    expect(sut.name).eq('ArithmeticOperator');
  });

  it('should mutate + and -', () => {
    expectJSMutation(sut, 'a + b', 'a - b');
    expectJSMutation(sut, 'a - b', 'a + b');
  });

  it('should mutate *, % and /', () => {
    expectJSMutation(sut, 'a * b', 'a / b');
    expectJSMutation(sut, 'a / b', 'a * b');
    expectJSMutation(sut, 'a % b', 'a * b');
  });

  it('should not mutate string literal concatenation', () => {
    expectJSMutation(sut, '"a" + "b"');
    expectJSMutation(sut, 'const a = 1; "a" + a');
    expectJSMutation(sut, '3 + "a"');

    expectJSMutation(sut, '`a` + `b`');
    expectJSMutation(sut, 'const a = 1; `a` + a');
    expectJSMutation(sut, '3 + `a`');

    expectJSMutation(sut, '"a" + b + "c" + d + "e"');
  });

  it('should only mutate +, - and * from all possible mutators', () => {
    expectJSMutationWithLevel(
      sut,
      arithmeticLevel.ArithmeticOperator,
      'a + b; a - b; a * b; a % b; a / b; a % b',
      'a - b; a - b; a * b; a % b; a / b; a % b', // mutates +
      'a + b; a + b; a * b; a % b; a / b; a % b', // mutates -
      'a + b; a - b; a / b; a % b; a / b; a % b', // mutates *
    );
  });
});
