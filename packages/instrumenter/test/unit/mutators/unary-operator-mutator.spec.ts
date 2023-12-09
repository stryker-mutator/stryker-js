import { expect } from 'chai';

import { unaryOperatorMutator as sut } from '../../../src/mutators/unary-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const unaryOperatorLevelA: MutationLevel = {
  name: 'unaryOperatorA',
  UnaryOperator: ['UnaryPlusOperatorNegation', 'UnaryBitwiseOrRemoval'],
};
const unaryOperatorLevelB: MutationLevel = { name: 'unaryOperatorB', UnaryOperator: ['UnaryMinOperatorNegation'] };

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
    expectJSMutationWithLevel(sut, unaryOperatorLevelA.UnaryOperator, '+a; -b; ~c;', '-a; -b; ~c;', '+a; -b; c;');
  });

  it('should only mutate -b to +b', () => {
    expectJSMutationWithLevel(sut, unaryOperatorLevelB.UnaryOperator, '+a; -b; ~c;', '+a; +b; ~c;');
  });
});
