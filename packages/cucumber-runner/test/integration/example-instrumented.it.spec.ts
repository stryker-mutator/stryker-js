import path from 'path';

import {
  assertions,
  factory,
  testInjector,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { MutantCoverage } from '@stryker-mutator/api/core';

import * as pluginTokens from '../../src/plugin-tokens';
import { CucumberTestRunner } from '../../src';
import { CucumberRunnerWithStrykerOptions } from '../../src/cucumber-runner-with-stryker-options';
import { resolveTestResource } from '../helpers/resolve-test-resource';

describe('Running in an example project', () => {
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
          [`${simpleMathFileName}:7`]: {
            '0': 1,
            '1': 1,
            '2': 1,
          },
        },
        static: {},
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
          '0': 3,
          '1': 3,
          '2': 3,
        },
      };
      expect(result.mutantCoverage).deep.eq(expectedMutantCoverage);
    });
  });

  describe(CucumberTestRunner.prototype.mutantRun.name, () => {
    it('should be able to kill a mutant', async () => {
      const sut = createSut();
      const actual = await sut.mutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '2' }) })
      );

      assertions.expectKilled(actual);
      expect(actual.killedBy).eq(`${simpleMathFileName}:19`);
      expect(actual.nrOfTests).eq(2);
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
      expect(actual.killedBy).eq(`${simpleMathFileName}:19`);
      expect(actual.nrOfTests).eq(1);
    });
  });
});
