import { expect } from 'chai';

import { unaryOperatorMutator as sut } from '../../../src/mutators/unary-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const unaryOperatorLevel: MutationLevel = {
  name: 'unaryOperatorLevel',
  UnaryOperator: ['UnaryPlusOperatorNegation', 'UnaryBitwiseOrRemoval'],
};
const unaryOperatorUndefinedLevel: MutationLevel = { name: 'unaryOperatorUndefinedLevel', UnaryOperator: [] };
const noLevel = undefined;

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

  describe('mutation level', () => {
    it('should only mutate unary + and ~', () => {
      expectJSMutationWithLevel(
        sut,
        unaryOperatorLevel.UnaryOperator,
        '+a; -b; ~c;',
        '-a; -b; ~c;', // mutates + to -
        '+a; -b; c;', // removes ~
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, unaryOperatorUndefinedLevel.UnaryOperator, '+a; -b; ~c;');
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        '+a; -b; ~c;',
        '-a; -b; ~c;', // mutates + to -
        '+a; -b; c;', // removes ~
        '+a; +b; ~c;', // mutates - to +
      );
    });
  });
});
