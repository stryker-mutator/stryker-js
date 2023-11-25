import { expect } from 'chai';

import { unaryOperatorMutator as sut } from '../../../src/mutators/unary-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';

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

  it('should not mutate -b to +b', () => {
    const unaryOperatorLevelA = { name: 'unaryOperatorA', UnaryOperator: ['+To-', 'remove~'] };
    expectJSMutationWithLevel(sut, unaryOperatorLevelA.UnaryOperator, '+a; -b; ~c;', '-a; -b; ~c;', '+a; -b; c;');
  });

  it('should only mutate -b to +b', () => {
    const unaryOperatorLevelB = { name: 'unaryOperatorB', UnaryOperator: ['-To+'] };
    expectJSMutationWithLevel(sut, unaryOperatorLevelB.UnaryOperator, '+a; -b; ~c;', '+a; +b; ~c;');
  });
});
