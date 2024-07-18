import { expect } from 'chai';

import { optionalChainingMutator as sut } from '../../../src/mutators/optional-chaining-mutator.js';

import { expectJSMutation, expectJSMutationWithLevel } from '../../helpers/expect-mutation.js';
import { MutationLevel } from '../../../src/mutation-level/mutation-level.js';

const optionalChainingLevel: MutationLevel = {
  name: 'OptionalChainingLevel',
  OptionalChaining: ['OptionalMemberExpressionOptionalRemoval'],
};
const optionalChainingUndefinedLevel: MutationLevel = {
  name: 'optionalChainingUndefinedLevel',
  OptionalChaining: [],
};

const noLevel = undefined;

describe(sut.name, () => {
  it('should have name "OptionalChaining"', () => {
    expect(sut.name).eq('OptionalChaining');
  });

  it('should mutate an optional member expression', () => {
    expectJSMutation(sut, 'foo?.bar', 'foo.bar');
  });
  it('should mutate an optional call expression', () => {
    expectJSMutation(sut, 'foo?.()', 'foo()');
  });
  it('should mutate an optional member expression with computed syntax', () => {
    expectJSMutation(sut, 'foo?.[0]', 'foo[0]');
  });
  it('should not mutate an optional member expression inside an optional call expression', () => {
    expectJSMutation(sut, 'qux()?.map()', 'qux().map()');
  });
  it('should mutate an optional chain', () => {
    expectJSMutation(sut, 'foo?.bar?.()?.[0]', 'foo.bar?.()?.[0]', 'foo?.bar()?.[0]', 'foo?.bar?.()[0]');
  });
  it('should not mutate the non-optional parts of a chain', () => {
    expectJSMutation(sut, 'foo.bar()?.[0]', 'foo.bar()[0]');
    expectJSMutation(sut, 'foo.bar?.()[0]', 'foo.bar()[0]');
    expectJSMutation(sut, 'foo.bar()?.baz', 'foo.bar().baz');
  });

  describe('mutation level', () => {
    it('should only mutate OptionalMemberExpression', () => {
      expectJSMutationWithLevel(
        sut,
        optionalChainingLevel.OptionalChaining,
        'foo?.bar; foo?.[0]; foo?.()',
        'foo.bar; foo?.[0]; foo?.()', // removes .bar optional
      );
    });
    it('should not perform any ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(sut, optionalChainingUndefinedLevel.OptionalChaining, 'foo?.bar; foo?.[0]; foo?.()');
    });
    it('should perform all ' + sut.name + ' mutations', () => {
      expectJSMutationWithLevel(
        sut,
        noLevel,
        'foo?.bar; foo?.[0]; foo?.()',
        'foo.bar; foo?.[0]; foo?.()', // removes .bar optional
        'foo?.bar; foo[0]; foo?.()', // removes [0] optional
        'foo?.bar; foo?.[0]; foo()', // removes () optional
      );
    });
  });
});
