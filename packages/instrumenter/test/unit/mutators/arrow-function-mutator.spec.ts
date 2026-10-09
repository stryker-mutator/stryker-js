import { expect } from 'chai';

import { arrowFunctionMutator as sut } from '../../../src/mutators/arrow-function-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "ArrowFunction"', () => {
    expect(sut.name).eq('ArrowFunction');
  });

  it('should mutate an anonymous function with an inline return', () => {
    expectJSMutation(
      sut,
      'const b = () => 4;',
      { isExpressionContext: false },
      'const b = () => undefined;',
    );
  });

  it('should not mutate an anonymous function with a block as a body', () => {
    expectJSMutation(sut, 'const b = () => { return 4; }', {
      isExpressionContext: false,
    });
  });

  it('should not mutate an anonymous function with undefined as a body', () => {
    expectJSMutation(sut, 'const b = () => undefined', {
      isExpressionContext: false,
    });
  });
});
