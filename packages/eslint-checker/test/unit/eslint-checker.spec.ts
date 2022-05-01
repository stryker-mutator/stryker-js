import sinon from 'sinon';
import { expect } from 'chai';
import { testInjector } from '@stryker-mutator/test-helpers';
import { HybridFileSystem } from '@stryker-mutator/util';
import { Mutant } from '@stryker-mutator/api/src/core';

import { LintChecker } from '../../src/eslint-checker.js';
import * as pluginTokens from '../../src/plugin-tokens.js';

describe('eslint-checker unit test', () => {
  describe(LintChecker.name, () => {
    let sut: LintChecker;
    let helper: sinon.SinonStubbedInstance<HybridFileSystem>;
    beforeEach(() => {
      helper = sinon.createStubInstance(HybridFileSystem);
      sut = testInjector.injector.provideValue(pluginTokens.fs, helper).injectClass(LintChecker);
    });

    describe(LintChecker.prototype.init.name, () => {
      it('should throw an error if reading file returns undefined', async () => {
        helper.getFile.returns(undefined);
        await expect(sut.init()).to.eventually.be.rejectedWith('Unable to open file ');
      });
    });

    describe(LintChecker.prototype.check.name, async () => {
      it('should throw an error if called with multiple mutants', async () => {
        // the interface is typed as an array, but the underlying implementation only ever calls with an array of 1.
        // this test can be removed once multiple mutants are properly handled
        const fakeMutant = {} as Mutant;
        await expect(sut.check([fakeMutant, fakeMutant])).to.eventually.be.rejectedWith(
          'Stryker implementation has changed and can now call check with multiple mutants'
        );
      });
    });
  });
});
