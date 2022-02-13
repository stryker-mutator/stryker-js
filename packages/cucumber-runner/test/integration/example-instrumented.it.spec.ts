import path from 'path';

import {
  assertions,
  factory,
  testInjector,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { MutantCoverage } from '@stryker-mutator/api/core';

import * as pluginTokens from '../../src/plugin-tokens.js';
import { CucumberTestRunner } from '../../src/index.js';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options.js';
import { resolveTestResource } from '../helpers/resolve-test-resource.js';

describe('Running in an instrumented example project', () => {
  let options: CucumberRunnerWithStrykerOptions;
  const simpleMathFileName = path.join('features', 'simple_math.feature');

  beforeEach(() => {
    options = testInjector.options as CucumberRunnerWithStrykerOptions;
    options.cucumber = {};
    process.chdir(resolveTestResource('example-instrumented'));
  });

  function createSut(): CucumberTestRunner {
    return testInjector.injector
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(CucumberTestRunner);
  }

  describe(CucumberTestRunner.prototype.dryRun.name, () => {
    it('should be able to report "perTest" coverage analysis', async () => {
      const sut = createSut();
      const result = await sut.dryRun(
        factory.dryRunOptions({ coverageAnalysis: 'perTest' })
      );
      assertions.expectCompleted(result);
      const expectedMutantCoverage: MutantCoverage = {
        perTest: {
          [`${simpleMathFileName}:19`]: {
            '0': 1,
            '1': 1,
            '2': 1,
          },
          [`${simpleMathFileName}:20`]: {
            '0': 1,
            '1': 1,
            '2': 1,
          },
          [`${simpleMathFileName}:22`]: {
            '0': 1,
            '1': 1,
            '2': 1,
            '6': 1,
          },
          [`${simpleMathFileName}:7`]: {
            '0': 1,
            '1': 1,
            '2': 1,
          },
        },
        static: { '5': 1, '7': 1 },
      };
      expect(result.mutantCoverage).deep.eq(expectedMutantCoverage);
    });
    it('should be able to report "all" coverage analysis', async () => {
      const sut = createSut();
      const result = await sut.dryRun(
        factory.dryRunOptions({ coverageAnalysis: 'all' })
      );
      assertions.expectCompleted(result);
      const expectedMutantCoverage: MutantCoverage = {
        perTest: {},
        static: {
          '0': 4,
          '1': 4,
          '2': 4,
          '5': 1,
          '6': 1,
          '7': 1,
        },
      };
      expect(result.mutantCoverage).deep.eq(expectedMutantCoverage);
    });
    it('should be able to report "off" coverage analysis', async () => {
      const sut = createSut();
      const result = await sut.dryRun(
        factory.dryRunOptions({ coverageAnalysis: 'off' })
      );
      assertions.expectCompleted(result);
      expect(result.mutantCoverage).undefined;
    });
  });

  describe(CucumberTestRunner.prototype.mutantRun.name, () => {
    it('should be able to kill a mutant', async () => {
      const sut = createSut();
      const actual = await sut.mutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '2' }) })
      );

      assertions.expectKilled(actual);
      expect(actual.killedBy).deep.eq([`${simpleMathFileName}:19`]);
      expect(actual.nrOfTests).eq(2);
    });

    it('should report all killedBy tests when disableBail is true', async () => {
      const sut = createSut();
      const actual = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '2' }),
          disableBail: true,
        })
      );

      assertions.expectKilled(actual);
      expect(actual.killedBy).deep.eq([
        `${simpleMathFileName}:19`,
        `${simpleMathFileName}:20`,
        `${simpleMathFileName}:22`,
      ]);
      expect(actual.nrOfTests).eq(4); // all tests ran
    });

    it('should be able to survive if the filtered tests are not killing', async () => {
      const sut = createSut();
      const actual = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '2' }),
          testFilter: [`${simpleMathFileName}:7`],
        })
      );

      assertions.expectSurvived(actual);
      expect(actual.nrOfTests).eq(1);
    });

    it('should be able to kill after surviving', async () => {
      const sut = createSut();
      await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '2' }),
          testFilter: [`${simpleMathFileName}:7`],
        })
      );
      const actual = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '2' }),
          testFilter: [`${simpleMathFileName}:19`],
        })
      );

      assertions.expectKilled(actual);
      expect(actual.killedBy).deep.eq([`${simpleMathFileName}:19`]);
      expect(actual.nrOfTests).eq(1);
    });

    it('should report a runtime error when a TypeError occurs during setup', async () => {
      const sut = createSut();
      const actual = await sut.mutantRun(
        factory.mutantRunOptions({
          // Mutant 5 clears the exported object
          // module.exports = stryMutAct_9fa48("5") ? {} : (stryCov_9fa48("5"), { Calculator });
          // This will result a sync error during test setup
          activeMutant: factory.mutant({ id: '5' }),
        })
      );
      assertions.expectErrored(actual);
      expect(actual.errorMessage.split('\n')[0]).eq(
        'TypeError: Calculator is not a constructor'
      );
    });

    it('should report a runtime error when a TypeError occurs during step execution', async () => {
      const sut = createSut();
      const actual = await sut.mutantRun(
        factory.mutantRunOptions({
          // Mutant 7 clears the exported object
          // module.exports = stryMutAct_9fa48("7") ? {} : (stryCov_9fa48("7"), { incrementBy });
          // This will result an error during step execution
          activeMutant: factory.mutant({ id: '7' }),
        })
      );
      assertions.expectErrored(actual);
      expect(actual.errorMessage.split('\n')[0]).eq(
        'TypeError: incrementBy is not a function'
      );
    });
  });
});
