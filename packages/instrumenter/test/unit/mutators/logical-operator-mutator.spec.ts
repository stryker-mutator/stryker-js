import { expect } from 'chai';

import { logicalOperatorMutator as sut } from '../../../src/mutators/logical-operator-mutator';
import { expectJSMutation } from '../../helpers/expect-mutation';

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
});
