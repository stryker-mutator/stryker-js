import { expect } from 'chai';

import { updateOperatorMutator as sut } from '../../../src/mutators/update-operator-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

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
});
