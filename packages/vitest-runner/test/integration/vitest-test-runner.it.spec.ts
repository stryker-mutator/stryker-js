/* eslint-disable @typescript-eslint/require-array-sort-compare */
import path from 'path';

import { factory, assertions, testInjector, TempTestDirectorySandbox } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { TestStatus } from '@stryker-mutator/api/test-runner';
import { normalizeFileName } from '@stryker-mutator/util';

import { createVitestTestRunnerFactory, VitestTestRunner } from '../../src/vitest-test-runner.js';
import { VitestRunnerOptionsWithStrykerOptions } from '../../src/vitest-runner-options-with-stryker-options.js';

describe('VitestRunner integration', () => {
  let sut: VitestTestRunner;
  let sandbox: TempTestDirectorySandbox;
  let options: VitestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    sut = testInjector.injector.injectFunction(createVitestTestRunnerFactory('__stryker2__'));
    options = testInjector.options as VitestRunnerOptionsWithStrykerOptions;
    options.vitest = {};
  });

  afterEach(async () => {
    await sut.dispose();
    await sandbox.dispose();
  });

  describe('using the simple-project project', () => {
    let test1: string;
    let test2: string;
    let test3: string;
    let test4: string;
    let test5: string;
    let sandboxFileName: string;

    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('simple-project');
      await sandbox.init();

      // Use normalizeFileName here, because vitest uses posix file names underneath
      test1 = `${normalizeFileName(path.resolve('tests', 'add.spec.ts'))}#add should be able to add two numbers`;
      test2 = `${normalizeFileName(path.resolve('tests', 'math.spec.ts'))}#math should be able negate a number`;
      test3 = `${normalizeFileName(path.resolve('tests', 'math.spec.ts'))}#math should be able to add one to a number`;
      test4 = `${normalizeFileName(path.resolve('tests', 'math.spec.ts'))}#math should be able to recognize a negative number`;
      test5 = `${normalizeFileName(path.resolve('tests', 'pi.spec.ts'))}#pi should be 3.14`;
      sandboxFileName = path.resolve(sandbox.tmpDir, 'math.ts');
      await sut.init();
    });

    describe(VitestTestRunner.prototype.dryRun.name, () => {
      it('should run the specs', async () => {
        const runResult = await sut.dryRun();
        assertions.expectCompleted(runResult);
        assertions.expectTestResults(runResult, [
          { id: test1, name: 'add should be able to add two numbers', status: TestStatus.Success },
          { id: test2, name: 'math should be able negate a number', status: TestStatus.Success },
          { id: test3, name: 'math should be able to add one to a number', status: TestStatus.Success },
          { id: test4, name: 'math should be able to recognize a negative number', status: TestStatus.Success },
          { id: test5, name: 'pi should be 3.14', status: TestStatus.Success },
        ]);
      });

      it('should report mutant coverage', async () => {
        const runResult = await sut.dryRun();
        assertions.expectCompleted(runResult);
        expect(runResult.mutantCoverage).deep.eq({
          static: {
            '0': 3,
          },
          perTest: {
            [test1]: {
              '1': 1,
              '2': 1,
            },
            [test2]: {
              '5': 1,
              '6': 1,
            },
            [test3]: {
              '3': 1,
              '4': 1,
            },
            [test4]: {
              '7': 1,
              '8': 1,
              '9': 1,
              '10': 1,
              '11': 1,
              '12': 1,
              '13': 1,
              '14': 1,
            },
          },
        });
      });
    });

    describe(VitestTestRunner.prototype.mutantRun.name, () => {
      it('should be able to kill a mutant', async () => {
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '2' }),
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: [test1],
          })
        );
        assertions.expectKilled(runResult);
        expect(runResult.killedBy).deep.eq([test1]);
      });

      it('should be able to survive after killing mutant', async () => {
        // Arrange
        await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '2' }),
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: [test1],
          })
        );

        // Act
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '11' }), // Should survive
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: [test5],
          })
        );

        // Assert
        assertions.expectSurvived(runResult);
        expect(runResult.nrOfTests).eq(1);
      });

      it('should be able to kill a static mutant', async () => {
        // Act
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '0' }), // Static mutant
            sandboxFileName,
            mutantActivation: 'static',
            testFilter: [test5],
          })
        );

        // Assert
        assertions.expectKilled(runResult);
        expect(runResult.killedBy).deep.eq([test5]);
        expect(runResult.failureMessage).contains('expected 2.86 to be 3.14');
      });

      it('should be able to reload the environment after a static mutant is tested', async () => {
        // Arrange
        await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '0' }), // Pollute the environment with a static mutant
            sandboxFileName,
            mutantActivation: 'static',
          })
        );

        // Act
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '11' }), // Should survive
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: undefined, // no test filter, so test5 is also executed, the one that kills the static mutant
          })
        );

        // Assert
        assertions.expectSurvived(runResult);
      });

      it('should not be able to kill a static mutant when mutantActivation is runTime', async () => {
        // Act
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '0' }), // Static mutant
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: [test5],
          })
        );

        // Assert
        assertions.expectSurvived(runResult);
      });

      it('mutant run with single filter should only run 1 test', async () => {
        const mutantRunOptions = factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '1' }),
          sandboxFileName,
          testFilter: [test1],
        });
        mutantRunOptions.activeMutant.id = '1';

        const runResult = await sut.mutantRun(mutantRunOptions);

        assertions.expectKilled(runResult);
        expect(runResult.nrOfTests).eq(1);
      });

      it('mutant run with 2 filters should run 2 tests', async () => {
        // Arrange
        const mutantRunOptions = factory.mutantRunOptions({
          mutantActivation: 'runtime',
          activeMutant: factory.mutant({ id: '2' }),
          sandboxFileName,
          testFilter: [test1, test3],
        });

        // Act
        const runResult = await sut.mutantRun(mutantRunOptions);

        // Assert
        assertions.expectKilled(runResult);
        expect(runResult.nrOfTests).eq(2);
        expect(runResult.killedBy).deep.eq([test1]);
        expect(runResult.failureMessage).contains('expected -3 to be 7');
      });
    });
  });

  describe('using multiple-configs project', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('multiple-configs');
      await sandbox.init();
    });

    it('should load default vitest config when config file is not set', async () => {
      options.vitest.configFile = undefined;

      await sut.init();
      const runResult = await sut.dryRun();

      assertions.expectCompleted(runResult);
      expect(runResult.tests).to.have.lengthOf(1);
      expect(runResult.tests[0].name).eq('math should be able to add two numbers');
    });

    it('should load custom vitest config when config file is set', async () => {
      options.vitest.configFile = 'vitest.only.addOne.config.ts';

      await sut.init();
      const runResult = await sut.dryRun();

      assertions.expectCompleted(runResult);
      expect(runResult.tests).to.have.lengthOf(1);
      expect(runResult.tests[0].name).eq('math should be able to add one to a number');
    });
  });

  describe('using a project using workspaces', () => {
    let fooTestId: string;
    let barTestId: string;

    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('workspaces');
      await sandbox.init();
      fooTestId = `${normalizeFileName(path.resolve('packages', 'foo', 'src', 'math.spec.js'))}#min should min 44, 2 = 42`;
      barTestId = `${normalizeFileName(path.resolve('packages', 'bar', 'src', 'math.spec.js'))}#add should add 40, 2 = 42`;
    });

    it('should report mutant coverage', async () => {
      await sut.init();
      const runResult = await sut.dryRun();
      assertions.expectCompleted(runResult);
      expect(runResult.mutantCoverage).deep.eq({
        static: {},
        perTest: {
          [barTestId]: {
            '0': 1,
            '1': 1,
          },
          [fooTestId]: {
            '2': 1,
            '3': 1,
          },
        },
      });
    });

    it('should be able to kill a mutant inside one of the projects', async () => {
      await sut.init();
      const runResult = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '1' }),
          sandboxFileName: path.resolve(sandbox.tmpDir, 'packages', 'bar', 'src', 'math.js'),
        })
      );
      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq([barTestId]);
    });
  });
});
