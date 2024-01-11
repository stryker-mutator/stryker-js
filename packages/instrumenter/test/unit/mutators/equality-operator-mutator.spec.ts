import { expect } from 'chai';

import { equalityOperatorMutator as sut } from '../../../src/mutators/equality-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const equalityOperatorLevel: MutationLevel = {
  name: 'EqualityOperatorLevel',
  EqualityOperator: [
    'LessThanOperatorBoundary',
    'LessThanOperatorNegation',
    'GreaterThanEqualOperatorBoundary',
    'GreaterThanEqualOperatorNegation',
    'EqualityOperatorNegation',
  ],
};

const equalityOperatorUndefinedLevel: MutationLevel = {
  name: 'EqualityOperatorUndefinedLevel',
  EqualityOperator: [],
};

const noLevel = undefined;

describe(sut.name, () => {
  it('should have name "EqualityOperator"', () => {
    expect(sut.name).eq('EqualityOperator');
  });

  it('should mutate < and >', () => {
    expectJSMutation(sut, 'a < b', 'a >= b', 'a <= b');
    expectJSMutation(sut, 'a > b', 'a <= b', 'a >= b');
  });

  it('should mutate <= and >=', () => {
    expectJSMutation(sut, 'a <= b', 'a < b', 'a > b');
    expectJSMutation(sut, 'a >= b', 'a < b', 'a > b');
  });

  it('should mutate == and ===', () => {
    expectJSMutation(sut, 'a == b', 'a != b');
    expectJSMutation(sut, 'a === b', 'a !== b');
  });

  it('should mutate != and !==', () => {
    expectJSMutation(sut, 'a != b', 'a == b');
    expectJSMutation(sut, 'a !== b', 'a === b');
  });

  describe('mutation level', () => {
    it('should only mutate <, >=, ==', () => {
      expectJSMutationWithLevel(
        sut,
        equalityOperatorLevel.EqualityOperator,
        'a < b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b',
        'a <= b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates < to <=
        'a >= b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates < to >=
        'a < b; a <= b; a > b; a > b; a == b; a != b; a === b; a !== b', // mutates >= To >
        'a < b; a <= b; a > b; a < b; a == b; a != b; a === b; a !== b', // mutates >= to <
        'a < b; a <= b; a > b; a >= b; a != b; a != b; a === b; a !== b', // mutates == to !=
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        equalityOperatorUndefinedLevel.EqualityOperator,
        'a < b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b',
      );
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        'a < b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b',
        'a < b; a < b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates <= to <
        'a < b; a <= b; a <= b; a >= b; a == b; a != b; a === b; a !== b', // mutates > to <=
        'a < b; a <= b; a > b; a < b; a == b; a != b; a === b; a !== b', // mutates <= to <
        'a < b; a <= b; a > b; a > b; a == b; a != b; a === b; a !== b', // mutates >= to >
        'a < b; a <= b; a > b; a >= b; a != b; a != b; a === b; a !== b', // mutates == to !=
        'a < b; a <= b; a > b; a >= b; a == b; a != b; a !== b; a !== b', // mutates === to !==
        'a < b; a <= b; a > b; a >= b; a == b; a != b; a === b; a === b', // mutates !== to ===
        'a < b; a <= b; a > b; a >= b; a == b; a == b; a === b; a !== b', // mutates != to ==
        'a < b; a <= b; a >= b; a >= b; a == b; a != b; a === b; a !== b', // mutates > to >=
        'a < b; a > b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates <= to >
        'a <= b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates < to <=
        'a >= b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates < to >=
      );
    });
  });
});
