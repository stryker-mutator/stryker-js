import { expect } from 'chai';

import { expressionStatementMutator as sut } from '../../../src/mutators/call-expression-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "CallExpression"', () => {
    expect(sut.name).eq('CallExpression');
  });

  it('should remove the call expression', () => {
    expectJSMutation(sut, 'foo();', ...[]);
  });

  it('should not remove the parent block', () => {
    expectJSMutation(
      sut,
      'const test = () => { foo(); }',
      'const test = () => {}',
    );
  });
});
