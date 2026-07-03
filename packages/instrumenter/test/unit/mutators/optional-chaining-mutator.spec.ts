import { expect } from 'chai';

import { optionalChainingMutator as sut } from '../../../src/mutators/optional-chaining-mutator.js';

import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe(sut.name, () => {
  it('should have name "OptionalChaining"', () => {
    expect(sut.name).eq('OptionalChaining');
  });

  it('should mutate an optional member expression', () => {
    expectJSMutation(
      sut,
      'foo?.bar',
      { isExpressionContext: false },
      'foo.bar',
    );
  });
  it('should mutate an optional call expression', () => {
    expectJSMutation(sut, 'foo?.()', { isExpressionContext: false }, 'foo()');
  });
  it('should mutate an optional member expression with computed syntax', () => {
    expectJSMutation(sut, 'foo?.[0]', { isExpressionContext: false }, 'foo[0]');
  });
  it('should not mutate an optional member expression inside an optional call expression', () => {
    expectJSMutation(
      sut,
      'qux()?.map()',
      { isExpressionContext: false },
      'qux().map()',
    );
  });
  it('should mutate an optional chain', () => {
    expectJSMutation(
      sut,
      'foo?.bar?.()?.[0]',
      { isExpressionContext: false },
      'foo.bar?.()?.[0]',
      'foo?.bar()?.[0]',
      'foo?.bar?.()[0]',
    );
  });
  it('should not mutate the non-optional parts of a chain', () => {
    expectJSMutation(
      sut,
      'foo.bar()?.[0]',
      { isExpressionContext: false },
      'foo.bar()[0]',
    );
    expectJSMutation(
      sut,
      'foo.bar?.()[0]',
      { isExpressionContext: false },
      'foo.bar()[0]',
    );
    expectJSMutation(
      sut,
      'foo.bar()?.baz',
      { isExpressionContext: false },
      'foo.bar().baz',
    );
  });
});
