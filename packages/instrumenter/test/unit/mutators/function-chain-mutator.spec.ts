import { expect } from 'chai';

import { functionChainMutator as sut } from '../../../src/mutators/function-chain-mutator.js';
import { expectJSMutation } from '../../helpers/expect-mutation.js';

describe.only(sut.name, () => {
  it('should have name "FunctionChain"', () => {
    expect(sut.name).eq('FunctionChain');
  });

  describe('functions', () => {
    it('should ignore a non-method', () => {
      expectJSMutation(sut, 'function endsWith() {} endsWith();');
    });
  });

  describe('methods', () => {
    it('should mutate an allowed method', () => {
      expectJSMutation(sut, 'input.startsWith();', 'input.endsWith();');
    });

    it('should mutate an allowed, optional method', () => {
      expectJSMutation(sut, 'input?.startsWith();', 'input?.endsWith();');
    });

    it('should mutate an allowed, optional method', () => {
      expectJSMutation(sut, 'input.startsWith?.();', 'input.endsWith?.();');
    });

    it('should mutate an allowed, optional method', () => {
      expectJSMutation(sut, 'input?.startsWith?.();', 'input?.endsWith?.();');
    });

    // todo: input.startsWith?.()
    // todo: prefix?.input?.startsWith?.()
    // todo: prefix?.input?.startsWith()
    // todo: prefix?.input.startsWith()
    // todo: prefix.input?.startsWith?.()

    it('should mutate another allowed method', () => {
      expectJSMutation(sut, 'input.endsWith();', 'input.startsWith();');
    });
  });
});
