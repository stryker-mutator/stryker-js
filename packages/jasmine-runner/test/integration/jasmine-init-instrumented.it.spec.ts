import path = require('path');

import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { MutantRunStatus } from '@stryker-mutator/api/test_runner';
import { assertions } from '@stryker-mutator/test-helpers';

import JasmineTestRunner, { createJasmineTestRunner } from '../../src/JasmineTestRunner';

describe('JasmineRunner integration with code instrumentation', () => {
  let sut: JasmineTestRunner;

  beforeEach(() => {
    process.chdir(path.resolve(__dirname, '../../testResources/jasmine-init-instrumented'));
    sut = testInjector.injector.injectFunction(createJasmineTestRunner);
  });

  afterEach(async () => {
    await sut.dispose();
  });

  describe('dryRun', () => {
    it('should not report coverage when coverageAnalysis is "off"', async () => {
      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).undefined;
    });

    it('should report static coverage when coverageAnalysis is "all"', async () => {
      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).not.undefined;
      expect(Object.keys(result.mutantCoverage!.perTest).length).eq(0);
      expect(Object.keys(result.mutantCoverage!.static).length).eq(11);
    });

    it('should report static and perTest coverage when coverageAnalysis is "perTest"', async () => {
      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).not.undefined;
      expect(Object.keys(result.mutantCoverage!.perTest).length).eq(5); // 5 tests
      expect(Object.keys(result.mutantCoverage!.static).length).eq(1);
    });
  });

  describe('mutantRun', () => {
    it('should be able to kill a mutant', async () => {
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 1 }) }));
      assertions.expectKilled(result);
      expect(result.killedBy).eq('spec0');
      expect(result.failureMessage).eq('Expected undefined to equal Song({  }).');
    });

    it('should be able report "survive" when a mutant is invincible', async () => {
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 9 }) }));
      assertions.expectSurvived(result);
    });

    it('should be able to kill again after a mutant survived', async () => {
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 9 }) }));
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 2 }) }));
      const expected = factory.killedMutantRunResult({
        killedBy: 'spec1',
        status: MutantRunStatus.Killed,
        failureMessage: 'Expected true to be falsy.',
        nrOfTests: 2, // spec0 and spec1
      });
      expect(result).deep.eq(expected);
    });
  });
});
