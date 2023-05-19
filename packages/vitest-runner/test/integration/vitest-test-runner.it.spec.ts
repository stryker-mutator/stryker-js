/* eslint-disable @typescript-eslint/require-array-sort-compare */
import path from 'path';

import { factory, assertions, testInjector, TempTestDirectorySandbox } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { TestStatus } from '@stryker-mutator/api/test-runner';

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

  describe.only('using the simple-project project', () => {
    let test1: string;
    let test2: string;
    let test3: string;
    let test4: string;
    let test5: string;
    let sandboxFileName: string;

    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('simple-project');
      await sandbox.init();
      test1 = `${path.resolve('tests', 'add.spec.ts')}#add should be able to add two numbers`;
      test2 = `${path.resolve('tests', 'math.spec.ts')}#math should be able negate a number`;
      test3 = `${path.resolve('tests', 'math.spec.ts')}#math should be able to add one to a number`;
      test4 = `${path.resolve('tests', 'math.spec.ts')}#math should be able to recognize a negative number`;
      test5 = `${path.resolve('tests', 'pi.spec.ts')}#pi should be 3.14`;
      sandboxFileName = path.resolve(sandbox.tmpDir, 'math.ts');
    });

    it('should run the specs', async () => {
      await sut.init();
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

    it('should report mutant coverage on dryRun', async () => {
      await sut.init();
      const runResult = await sut.dryRun();
      assertions.expectCompleted(runResult);
      console.log(JSON.stringify(runResult.mutantCoverage, null, 2));
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

    it('should be able to kill a mutant', async () => {
      await sut.init();
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
      await sut.init();
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
      // Arrange
      await sut.init();

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
      expect(runResult.tests[0].name).eq('should be able to add two numbers');
    });

    it('should load custom vitest config when config file is set', async () => {
      options.vitest.configFile = 'vitest.only.addOne.config.ts';

      await sut.init();
      const runResult = await sut.dryRun();

      assertions.expectCompleted(runResult);
      expect(runResult.tests).to.have.lengthOf(1);
      expect(runResult.tests[0].name).eq('should be able to add one to a number');
    });
  });

  describe('using a project using workspaces', () => {
    let fooTestId: string;
    let barTestId: string;

    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('workspaces');
      await sandbox.init();
      fooTestId = `${path.resolve('packages', 'foo', 'src', 'math.spec.js')}#min should min 44, 2 = 42`;
      barTestId = `${path.resolve('packages', 'bar', 'src', 'math.spec.js')}#add should add 40, 2 = 42`;
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

  describe('mutantRun', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('simple-project');
      await sandbox.init();
    });

    it('should kill mutant 1 with mutantActivation static', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'static',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: path.resolve(sandbox.tmpDir, 'math.ts'),
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq([`${path.resolve('tests', 'math.spec.ts')}#math should be able to add two numbers`]);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });

    it('should kill mutant 1 with mutantActivation runtime', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'runtime',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: path.resolve(sandbox.tmpDir, 'math.ts'),
      });

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq([`${path.resolve('tests', 'math.spec.ts')}#math should be able to add two numbers`]);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });

    it('mutant run with single filter should only run 1 test', async () => {
      await sut.init();
      const expectedTestId = `${path.resolve('tests', 'math.spec.ts')}#math should be able to add two numbers`;
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'runtime',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: path.resolve(sandbox.tmpDir, 'math.ts'),
        testFilter: [expectedTestId],
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.nrOfTests).eq(1);
      expect(runResult.killedBy).deep.eq([expectedTestId]);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });

    it('mutant run with 2 filters should run 2 tests', async () => {
      const expectedKillingTestId = `${path.resolve(sandbox.tmpDir, 'tests', 'math.spec.ts')}#math should be able to add two numbers`;
      const otherTestId = `${path.resolve(sandbox.tmpDir, 'tests', 'math.spec.ts')}#math should be able to add one to a number`;
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'runtime',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: path.resolve(sandbox.tmpDir, 'math.ts'),
        testFilter: [expectedKillingTestId, otherTestId],
      });
      mutantRunOptions.activeMutant.id = '1';

      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectKilled(runResult);
      expect(runResult.nrOfTests).eq(2);
      expect(runResult.killedBy).deep.eq([expectedKillingTestId]);
      expect(runResult.failureMessage.replace(/\x1B[[(?);]{0,2}(;?\d)*./g, '')).contains('expected -3 to be 7');
    });

    it('mutant run with new filter on second run should run 1 test', async () => {
      await sut.init();
      const mutantRunOptions = factory.mutantRunOptions({
        mutantActivation: 'runtime',
        activeMutant: factory.mutant({ id: '1' }),
        sandboxFileName: path.resolve(sandbox.tmpDir, 'math.ts'),
        testFilter: ['math.spec.ts#math should be able to add two numbers'],
      });
      mutantRunOptions.activeMutant.id = '1';

      await sut.mutantRun(mutantRunOptions);
      mutantRunOptions.testFilter = ['math.spec.ts#math should be able to add one to a number'];
      const runResult = await sut.mutantRun(mutantRunOptions);

      assertions.expectSurvived(runResult);
      expect(runResult.nrOfTests).eq(1);
    });
  });
});
