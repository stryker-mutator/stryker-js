import { expect } from 'chai';

import { UpdateOperatorMutator } from '../../../src/mutators/update-operator-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

describe(UpdateOperatorMutator.name, () => {
  let sut: UpdateOperatorMutator;
  beforeEach(() => {
    sut = new UpdateOperatorMutator();
  });

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
