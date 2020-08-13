import path from 'path';

import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { KilledMutantRunResult, MutantRunStatus } from '@stryker-mutator/api/test_runner2';

import { KarmaTestRunner } from '../../src/KarmaTestRunner';
import { KarmaRunnerOptionsWithStrykerOptions } from '../../src/KarmaRunnerOptionsWithStrykerOptions';
import { StrykerReporter } from '../../src/karma-plugins/StrykerReporter';

function createSut() {
  return testInjector.injector.injectClass(KarmaTestRunner);
}

describe(`${KarmaTestRunner.name} running on instrumented code`, () => {
  let sut: KarmaTestRunner;

  describe('with jasmine', () => {
    before(async () => {
      (testInjector.options as KarmaRunnerOptionsWithStrykerOptions).karma = {
        projectType: 'custom',
        configFile: path.resolve(__dirname, '..', '..', 'testResources', 'instrumented', 'karma-jasmine.conf.js'),
      };
      sut = createSut();
      await sut.init();
    });

    after(() => {
      StrykerReporter.instance.removeAllListeners();
    });

    describe('dryRun', () => {
      it('should only report static coverage if coverage analysis is "all"', async () => {
        const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
        assertions.expectCompleted(result);
        expect(result.mutantCoverage).ok;
        expect(result.mutantCoverage!.static).deep.eq({
          '0': 1,
          '1': 1,
          '2': 1,
          '3': 1,
          '4': 2,
          '5': 2,
          '6': 2,
          '7': 1,
          '8': 1,
          '9': 1,
          '10': 1,
        });
        expect(result.mutantCoverage!.perTest).deep.eq({});
      });

      it('should report "perTest" coverage if coverage analysis is "perTest"', async () => {
        const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        assertions.expectCompleted(result);
        expect(result.mutantCoverage).ok;
        expect(result.mutantCoverage!.static).deep.eq({});
        expect(result.mutantCoverage!.perTest).deep.eq({
          spec0: {
            '0': 1,
            '1': 1,
          },
          spec1: {
            '2': 1,
          },
          spec2: {
            '3': 1,
          },
          spec3: {
            '4': 1,
            '5': 1,
            '6': 1,
            '7': 1,
          },
          spec4: {
            '4': 1,
            '5': 1,
            '6': 1,
          },
          spec5: {
            '8': 1,
            '9': 1,
            '10': 1,
          },
        });
      });

      it('should not report coverage when coverage analysis is "off"', async () => {
        const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
        assertions.expectCompleted(result);
        expect(result.mutantCoverage).not.ok;
      });
    });

    describe('mutantRun', () => {
      it('should be able to kill a mutant', async () => {
        const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 0 }) }));
        assertions.expectKilled(result);
        expect(result.killedBy).eq('spec0');
        expect(result.failureMessage.split('\n')[0]).eq('Error: Expected undefined to be 7.');
      });

      it('should survive if the filtered tests do not kill the mutant', async () => {
        const result = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: 2 }),
            testFilter: [
              'spec0',
              //'spec1' => would kill the mutant
              'spec2',
            ],
          })
        );
        assertions.expectSurvived(result);
      });

      it('should be able to kill again after a mutant survived', async () => {
        await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 11 }) }));
        const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 2 }), testFilter: ['spec1'] }));
        assertions.expectKilled(result);
        result.failureMessage = result.failureMessage.split('\n')[0];
        const expected: KilledMutantRunResult = {
          killedBy: 'spec1',
          status: MutantRunStatus.Killed,
          failureMessage: 'Error: Expected undefined to be 3.',
        };
        expect(result).deep.eq(expected);
      });

      it('should be able to clear the test filter', async () => {
        await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 2 }), testFilter: ['spec1'] }));
        const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 1 }), testFilter: undefined }));
        assertions.expectKilled(result);
      });
    });
  });
  describe('with mocha', () => {
    before(async () => {
      (testInjector.options as KarmaRunnerOptionsWithStrykerOptions).karma = {
        projectType: 'custom',
        configFile: path.resolve(__dirname, '..', '..', 'testResources', 'instrumented', 'karma-mocha.conf.js'),
      };
      sut = createSut();
      await sut.init();
    });
    after(() => {
      StrykerReporter.instance.removeAllListeners();
    });

    describe('dryRun', () => {
      it('should only report static coverage if coverage analysis is "all"', async () => {
        const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
        assertions.expectCompleted(result);
        expect(result.mutantCoverage).ok;
        expect(result.mutantCoverage!.static).deep.eq({
          '0': 1,
          '1': 1,
          '2': 1,
          '3': 1,
          '4': 2,
          '5': 2,
          '6': 2,
          '7': 1,
          '8': 1,
          '9': 1,
          '10': 1,
        });
        expect(result.mutantCoverage!.perTest).deep.eq({});
      });

      it('should report "perTest" coverage if coverage analysis is "perTest"', async () => {
        const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        assertions.expectCompleted(result);
        expect(result.mutantCoverage).ok;
        expect(result.mutantCoverage!.static).deep.eq({});
        expect(result.mutantCoverage!.perTest).deep.eq({
          'Add should be able to add two numbers': {
            '0': 1,
            '1': 1,
          },
          'Add should be able 1 to a number': {
            '2': 1,
          },
          'Add should be able negate a number': {
            '3': 1,
          },
          'Add should be able to recognize a negative number': {
            '4': 1,
            '5': 1,
            '6': 1,
            '7': 1,
          },
          'Add should be able to recognize that 0 is not a negative number': {
            '4': 1,
            '5': 1,
            '6': 1,
          },
          'Circle should have a circumference of 2PI when the radius is 1': {
            '8': 1,
            '9': 1,
            '10': 1,
          },
        });
      });
    });

    describe('mutantRun', () => {
      it('should be able to kill a mutant', async () => {
        const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 0 }) }));
        assertions.expectKilled(result);
        expect(result.killedBy).eq('Add should be able to add two numbers');
        expect(result.failureMessage.split('\n')[0]).eq('AssertionError: expected undefined to equal 7');
      });

      it('should survive if the filtered tests do not kill the mutant', async () => {
        const result = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: 2 }),
            testFilter: [
              'Add should be able to add two numbers',
              //'Add should be able 1 to a number' => would kill the mutant
              'Add should be able negate a number',
            ],
          })
        );
        assertions.expectSurvived(result);
      });

      it('should be able to kill again after a mutant survived', async () => {
        await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 11 }) }));
        const result = await sut.mutantRun(
          factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 2 }), testFilter: ['Add should be able 1 to a number'] })
        );
        assertions.expectKilled(result);
        result.failureMessage = result.failureMessage.split('\n')[0];
        const expected: KilledMutantRunResult = {
          killedBy: 'Add should be able 1 to a number',
          status: MutantRunStatus.Killed,
          failureMessage: 'AssertionError: expected undefined to equal 3',
        };
        expect(result).deep.eq(expected);
      });

      it('should be able to clear the test filter', async () => {
        await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 2 }), testFilter: ['Add should be able 1 to a number'] }));
        const result = await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 1 }), testFilter: undefined }));
        assertions.expectKilled(result);
      });
    });
  });
});
