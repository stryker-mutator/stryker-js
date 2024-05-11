import { expect } from 'chai';

import { logicalOperatorMutator as sut } from '../../../src/mutators/logical-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const logicalOperatorLevel: MutationLevel = {
  name: 'logicalOperatorLevel',
  LogicalOperator: ['LogicalOrOperatorToLogicalAndReplacement', 'LogicalAndOperatorToLogicalOrReplacement'],
};

const logicalOperatorUndefinedLevel: MutationLevel = {
  name: 'logicalOperatorUndefinedLevel',
  LogicalOperator: [],
};

const noLevel = undefined;

describe(sut.name, () => {
  it('should have name "LogicalOperator"', () => {
    expect(sut.name).eq('LogicalOperator');
  });

  it('should mutate &&', () => {
    expectJSMutation(sut, 'a && b', 'a || b');
  });

  it('should mutate ||', () => {
    expectJSMutation(sut, 'a || b', 'a && b');
  });

  it('should not mutate & and |', () => {
    expectJSMutation(sut, 'a & b');
    expectJSMutation(sut, 'a | b');
  });

  it('should mutate ?? to &&', () => {
    expectJSMutation(sut, 'a ?? b', 'a && b');
  });

  describe('mutation level', () => {
    it('should only mutate || and &&', () => {
      expectJSMutationWithLevel(
        sut,
        logicalOperatorLevel.LogicalOperator,
        'a || b; a && b; a ?? b',
        'a && b; a && b; a ?? b', // mutates || to &&
        'a || b; a || b; a ?? b', // mutates && to ||
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, logicalOperatorUndefinedLevel.LogicalOperator, 'a || b; a && b; a ?? b');
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        'a || b; a && b; a ?? b',
        'a && b; a && b; a ?? b', // mutates || to &&
        'a || b; a || b; a ?? b', // mutates && to ||
        'a || b; a && b; a && b', // mutates ?? to &&
      );
    });
  });
});
