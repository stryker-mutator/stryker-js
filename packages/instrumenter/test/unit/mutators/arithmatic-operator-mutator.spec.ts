import { expect } from 'chai';

import { arithmeticOperatorMutator as sut } from '../../../src/mutators/arithmetic-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const arithmeticLevel: MutationLevel = {
  name: 'ArithemticLevel',
  ArithmeticOperator: ['AdditionOperatorNegation', 'SubtractionOperatorNegation', 'MultiplicationOperatorNegation'],
};
const arithmeticOperatorUndefinedLevel: MutationLevel = { name: 'ArithmeticOperatorLevel', ArithmeticOperator: [] };
const noLevel = undefined;

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

  describe('mutation level', () => {
    it('should only mutate +, - and *', () => {
      expectJSMutationWithLevel(
        sut,
        arithmeticLevel.ArithmeticOperator,
        'a + b; a - b; a * b; a % b; a / b; a % b',
        'a - b; a - b; a * b; a % b; a / b; a % b', // mutates +
        'a + b; a + b; a * b; a % b; a / b; a % b', // mutates -
        'a + b; a - b; a / b; a % b; a / b; a % b', // mutates *
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, arithmeticOperatorUndefinedLevel.ArithmeticOperator, 'a + b; a - b; a * b; a % b; a / b; a % b');
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        'a + b; a - b; a * b; a % b; a / b; a % b',
        'a + b; a - b; a * b; a % b; a * b; a % b', // mutates /
        'a + b; a - b; a * b; a % b; a / b; a * b', // mutates %
        'a + b; a - b; a * b; a * b; a / b; a % b', // mutates %
        'a - b; a - b; a * b; a % b; a / b; a % b', // mutates +
        'a + b; a + b; a * b; a % b; a / b; a % b', // mutates -
        'a + b; a - b; a / b; a % b; a / b; a % b', // mutates *
      );
    });
  });
});
