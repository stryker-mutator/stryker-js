import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { createTypescriptChecker } from '../../src/index.js';

import { TypescriptChecker } from '../../src/typescript-checker.js';
import { TypescriptCheckerOptionsWithStrykerOptions } from '../../src/typescript-checker-options-with-stryker-options';

describe('typescript-checker', () => {
  let sut: TypescriptChecker;
  beforeEach(() => {
    sut = testInjector.injector.injectFunction(createTypescriptChecker);
    return sut.init();
  });

  describe(TypescriptChecker.prototype.group.name, () => {
    it('should not group mutants if prioritizePerformanceOverAccuracy is false', async () => {
      (testInjector.options as TypescriptCheckerOptionsWithStrykerOptions).typescriptChecker = { prioritizePerformanceOverAccuracy: false };
      const result = await sut.group([factory.mutant(), factory.mutant(), factory.mutant()]);
      expect(result.length).to.be.eq(3);
    });

    it('should group mutants if prioritizePerformanceOverAccuracy is true', async () => {
      (testInjector.options as TypescriptCheckerOptionsWithStrykerOptions).typescriptChecker = { prioritizePerformanceOverAccuracy: true };
      const result = await sut.group([factory.mutant(), factory.mutant(), factory.mutant()]);
      expect(result.length).to.be.eq(1);
    });
  });
});
