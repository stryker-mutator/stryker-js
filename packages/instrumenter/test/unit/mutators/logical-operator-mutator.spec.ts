import { expect } from 'chai';

import { logicalOperatorMutator as sut } from '../../../src/mutators/logical-operator-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "LogicalOperator"', () => {
    expect(sut.name).eq('LogicalOperator');
  });

  it('should mutate &&', () => {
    expectJSMutation(sut, 'a && b', { isExpressionContext: false }, 'a || b');
  });

  it('should mutate ||', () => {
    expectJSMutation(sut, 'a || b', { isExpressionContext: false }, 'a && b');
  });

  it('should not mutate & and |', () => {
    expectJSMutation(sut, 'a & b', { isExpressionContext: false });
    expectJSMutation(sut, 'a | b', { isExpressionContext: false });
  });

  it('should mutate ?? to &&', () => {
    expectJSMutation(sut, 'a ?? b', { isExpressionContext: false }, 'a && b');
  });
});
