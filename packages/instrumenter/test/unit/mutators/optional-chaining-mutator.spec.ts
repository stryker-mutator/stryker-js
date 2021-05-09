import { expect } from 'chai';

import { OptionalChainingMutator } from '../../../src/mutators/optional-chaining-mutator';

import { expectJSMutation } from '../../helpers/expect-mutation';

describe(OptionalChainingMutator.name, () => {
  let sut: OptionalChainingMutator;
  beforeEach(() => {
    sut = new OptionalChainingMutator();
  });

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
  it('should mutate an optional chain', () => {
    expectJSMutation(sut, 'foo?.bar?.()?.[0]', 'foo.bar?.()?.[0]', '(foo?.bar)()?.[0]', '(foo?.bar?.())[0]');
  });
});
