import { expect } from 'chai';

import { UnaryOperatorMutator } from '../../../src/mutators/unary-operator-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

describe(UnaryOperatorMutator.name, () => {
  let sut: UnaryOperatorMutator;
  beforeEach(() => {
    sut = new UnaryOperatorMutator();
  });

  it('should have name "UnaryOperator"', () => {
    expect(sut.name).eq('UnaryOperator');
  });

  it('should mutate -a to +a', () => {
    expectJSMutation(sut, '-a', '+a');
  });

  it('should mutate +a to -a', () => {
    expectJSMutation(sut, '+a', '-a');
  });

  it('should mutate ~a to a', () => {
    expectJSMutation(sut, '~a', 'a');
  });

  it('should not mutate a+a', () => {
    expectJSMutation(sut, 'a+a');
  });

  it('should not mutate a-a', () => {
    expectJSMutation(sut, 'a-a');
  });
});
