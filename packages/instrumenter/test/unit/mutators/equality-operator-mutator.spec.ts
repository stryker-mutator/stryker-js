import { expect } from 'chai';

import { equalityOperatorMutator as sut } from '../../../src/mutators/equality-operator-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

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
});
