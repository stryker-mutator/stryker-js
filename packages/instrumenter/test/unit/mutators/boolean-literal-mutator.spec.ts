import { expect } from 'chai';

import { booleanLiteralMutator as sut } from '../../../src/mutators/boolean-literal-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "BooleanLiteral"', () => {
    expect(sut.name).eq('BooleanLiteral');
  });

  it('should mutate `true` into `false`', () => {
    expectJSMutation(sut, 'true', { isExpressionContext: false }, 'false');
  });

  it('should mutate `false` into `true`', () => {
    expectJSMutation(sut, 'false', { isExpressionContext: false }, 'true');
  });

  it('should mutate !a to a', () => {
    expectJSMutation(sut, '!a', { isExpressionContext: false }, 'a');
  });
});
