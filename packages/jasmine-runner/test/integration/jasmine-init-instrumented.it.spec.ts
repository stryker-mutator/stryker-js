import { factory, testInjector, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { MutantRunStatus } from '@stryker-mutator/api/test-runner';

import { JasmineTestRunner, createJasmineTestRunnerFactory } from '../../src';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('JasmineRunner integration with code instrumentation', () => {
  let sut: JasmineTestRunner;

  beforeEach(() => {
    process.chdir(resolveTestResource('jasmine-init-instrumented'));
    sut = testInjector.injector.injectFunction(createJasmineTestRunnerFactory('__stryker2__'));
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
      expect(Object.keys(result.mutantCoverage!.static).length).eq(13);
    });

    it('should report static and perTest coverage when coverageAnalysis is "perTest"', async () => {
      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).not.undefined;
      expect(Object.keys(result.mutantCoverage!.perTest).length).eq(5); // 5 tests
      expect(Object.keys(result.mutantCoverage!.static).length).eq(1); // 1 static mutant
    });
  });

  describe('mutantRun', () => {
    it('should be able to kill a mutant', async () => {
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 1 }) }));
      assertions.expectKilled(result);
      expect(result.killedBy).eq('spec0');
      expect(result.failureMessage).eq('Expected Player({ currentlyPlayingSong: Song({  }), isPlaying: false }) to be playing Song({  }).');
    });

    it('should be able report "survive" when a mutant is invincible', async () => {
      const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 12 }) }));
      assertions.expectSurvived(result);
    });

    it('should be able to kill again after a mutant survived', async () => {
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 12 }) }));
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
