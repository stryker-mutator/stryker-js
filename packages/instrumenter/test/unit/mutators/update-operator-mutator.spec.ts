import { expect } from 'chai';

import { updateOperatorMutator as sut } from '../../../src/mutators/update-operator-mutator.js';
import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';

const updateLevel: string[] = ['Pre--To++', 'Pre++To--'];
const updateLevel2: string[] = ['Post++To--', 'Post--To++'];
const updateLevel3 = undefined;

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

  it('should only mutate --a and ++a', () => {
    expectJSMutationWithLevel(
      sut,
      updateLevel,
      '--a; ++a; a--; a++',
      '++a; ++a; a--; a++', //mutates --a
      '--a; --a; a--; a++', //mutates ++a
    );
  });

  it('should only mutate a-- and a++', () => {
    expectJSMutationWithLevel(
      sut,
      updateLevel2,
      '--a; ++a; a--; a++',
      '--a; ++a; a--; a--', //mutates a++
      '--a; ++a; a++; a++', //mutates a--
    );
  });

  it('should mutate all', () => {
    expectJSMutationWithLevel(
      sut,
      updateLevel3,
      '--a; ++a; a--; a++',
      '++a; ++a; a--; a++', //mutates --a
      '--a; --a; a--; a++', //mutates ++a
      '--a; ++a; a--; a--', //mutates a++
      '--a; ++a; a++; a++', //mutates a--
    );
  });
});
