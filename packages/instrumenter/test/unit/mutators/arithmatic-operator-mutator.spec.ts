import { expect } from 'chai';

import { arithmeticOperatorMutator as sut } from '../../../src/mutators/arithmetic-operator-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "ArithmeticOperator"', () => {
    expect(sut.name).eq('ArithmeticOperator');
  });

  it('should mutate + and -', () => {
    expectJSMutation(sut, 'a + b', { isExpressionContext: false }, 'a - b');
    expectJSMutation(sut, 'a - b', { isExpressionContext: false }, 'a + b');
  });

  it('should mutate *, % and /', () => {
    expectJSMutation(sut, 'a * b', { isExpressionContext: false }, 'a / b');
    expectJSMutation(sut, 'a / b', { isExpressionContext: false }, 'a * b');
    expectJSMutation(sut, 'a % b', { isExpressionContext: false }, 'a * b');
  });

  it('should not mutate string literal concatenation', () => {
    expectJSMutation(sut, '"a" + "b"', { isExpressionContext: false });
    expectJSMutation(sut, 'const a = 1; "a" + a', {
      isExpressionContext: false,
    });
    expectJSMutation(sut, '3 + "a"', { isExpressionContext: false });

    expectJSMutation(sut, '`a` + `b`', { isExpressionContext: false });
    expectJSMutation(sut, 'const a = 1; `a` + a', {
      isExpressionContext: false,
    });
    expectJSMutation(sut, '3 + `a`', { isExpressionContext: false });

    expectJSMutation(sut, '"a" + b + "c" + d + "e"', {
      isExpressionContext: false,
    });
  });
});
