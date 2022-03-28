import { expect } from 'chai';

import { unaryOperatorMutator as sut } from '../../../src/mutators/unary-operator-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
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
