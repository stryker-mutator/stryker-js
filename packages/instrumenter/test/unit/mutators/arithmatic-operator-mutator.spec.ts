import { expect } from 'chai';

import { ArithmeticOperatorMutator } from '../../../src/mutators/arithmetic-operator-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

describe(ArithmeticOperatorMutator.name, () => {
  let sut: ArithmeticOperatorMutator;
  beforeEach(() => {
    sut = new ArithmeticOperatorMutator();
  });

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
});
