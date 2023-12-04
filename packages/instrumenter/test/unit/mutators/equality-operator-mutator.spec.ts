import { expect } from 'chai';

import { equalityOperatorMutator as sut } from '../../../src/mutators/equality-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutators/mutation-level-options.js';

const equalityLevelA: MutationLevel = { name: 'EqualityLevelA', EqualityOperator: ['<To<=', '<To>=', '>=To>', '>=To<', '==To!='] };

const equalityLevelB: MutationLevel = { name: 'EqualityLevelB', EqualityOperator: ['<=To>', '>To<=', '===To!=='] };

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

  it('should only mutate <, >=, == from all possible mutators', () => {
    expectJSMutationWithLevel(
      sut,
      equalityLevelA.EqualityOperator,
      'a < b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b',
      'a <= b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates <
      'a >= b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates <
      'a < b; a <= b; a > b; a > b; a == b; a != b; a === b; a !== b', // mutates >=
      'a < b; a <= b; a > b; a < b; a == b; a != b; a === b; a !== b', // mutates >=
      'a < b; a <= b; a > b; a >= b; a != b; a != b; a === b; a !== b', // mutates ==
    );
  });

  it('should only mutate <= to >, > to <=, and === to !== from all possible mutators', () => {
    expectJSMutationWithLevel(
      sut,
      equalityLevelB.EqualityOperator,
      'a < b; a <= b; a > b; a >= b; a == b; a != b; a === b; a !== b',
      'a < b; a > b; a > b; a >= b; a == b; a != b; a === b; a !== b', // mutates <= to >
      'a < b; a <= b; a <= b; a >= b; a == b; a != b; a === b; a !== b', // mutates > to <=
      'a < b; a <= b; a > b; a >= b; a == b; a != b; a !== b; a !== b', // mutates === to !==
    );
  });
});
