import { expect } from 'chai';

import { optionalChainingMutator as sut } from '../../../src/mutators/optional-chaining-mutator';

import { expectJSMutation } from '../../helpers/expect-mutation';

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
});
