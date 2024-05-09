import { expect } from 'chai';

import { updateOperatorMutator as sut } from '../../../src/mutators/update-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const updateLevel: MutationLevel = {
  name: 'UpdateLevel',
  UpdateOperator: ['PrefixDecrementOperatorNegation', 'PrefixIncrementOperatorNegation'],
};

const updateUndefinedLevel: MutationLevel = {
  name: 'UpdateLevel3',
  UpdateOperator: [],
};
const noLevel = undefined;

describe(sut.name, () => {
  it('should have name "UpdateOperator"', () => {
    expect(sut.name).eq('UpdateOperator');
  });

  it('should mutate a++ to a--', () => {
    expectJSMutation(sut, 'a++', 'a--');
  });

  it('should mutate a-- to a++', () => {
    expectJSMutation(sut, 'a--', 'a++');
  });

  it('should mutate ++a to --a', () => {
    expectJSMutation(sut, '++a', '--a');
  });

  it('should mutate --a to ++a', () => {
    expectJSMutation(sut, '--a', '++a');
  });

  describe('mutation level', () => {
    it('should only mutate --a and ++a', () => {
      expectJSMutationWithLevel(
        sut,
        updateLevel.UpdateOperator,
        '--a; ++a; a--; a++',
        '++a; ++a; a--; a++', //mutates --a
        '--a; --a; a--; a++', //mutates ++a
      );
    });

    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, updateUndefinedLevel.UpdateOperator, '--a; ++a; a--; a++');
    });

    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        '--a; ++a; a--; a++',
        '++a; ++a; a--; a++', //mutates --a
        '--a; --a; a--; a++', //mutates ++a
        '--a; ++a; a--; a--', //mutates a++
        '--a; ++a; a++; a++', //mutates a--
      );
    });
  });
});
