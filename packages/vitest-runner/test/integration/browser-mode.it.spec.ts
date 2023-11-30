import path from 'path';

import { assertions, factory, TempTestDirectorySandbox, testInjector } from '@stryker-mutator/test-helpers';

import { TestStatus } from '@stryker-mutator/api/test-runner';

import { expect } from 'chai';

import { createVitestTestRunnerFactory, VitestTestRunner } from '../../src/vitest-test-runner.js';
import { VitestRunnerOptionsWithStrykerOptions } from '../../src/vitest-runner-options-with-stryker-options.js';

const test1 = 'src/heading.component.spec.ts#HeadingComponent should project its content';
const test2 = 'src/math.component.spec.ts#my-math should support simple addition';
const test3 = 'src/math.component.spec.ts#my-math should support simple subtraction';

describe('VitestRunner integration', () => {
  let sut: VitestTestRunner;
  let sandbox: TempTestDirectorySandbox;
  let options: VitestRunnerOptionsWithStrykerOptions;
  let sandboxFileName: string;

  beforeEach(async () => {
    sut = testInjector.injector.injectFunction(createVitestTestRunnerFactory('__stryker2__'));
    options = testInjector.options as VitestRunnerOptionsWithStrykerOptions;
    options.vitest = {};

    sandbox = new TempTestDirectorySandbox('browser-project', { soft: true });
    await sandbox.init();
    sandboxFileName = path.resolve(sandbox.tmpDir, 'src/heading.component.ts');
    await sut.init();
  });
  afterEach(async () => {
    await sut.dispose();
    await sandbox.dispose();
  });

  describe(VitestTestRunner.prototype.dryRun.name, () => {
    it('should report the run result', async () => {
      const runResult = await sut.dryRun();
      assertions.expectCompleted(runResult);
      assertions.expectTestResults(runResult, [
        {
          id: test1,
          fileName: path.resolve('src/heading.component.spec.ts'),
          name: 'HeadingComponent should project its content',
          status: TestStatus.Success,
        },
        {
          id: test2,
          fileName: path.resolve('src/math.component.spec.ts'),
          name: 'my-math should support simple addition',
          status: TestStatus.Success,
        },
        {
          id: test3,
          fileName: path.resolve('src/math.component.spec.ts'),
          name: 'my-math should support simple subtraction',
          status: TestStatus.Success,
        },
      ]);
    });

    it('should report mutant coverage', async () => {
      const runResult = await sut.dryRun();
      assertions.expectCompleted(runResult);
      expect(runResult.mutantCoverage).deep.eq({
        perTest: {
          [test1]: {
            '0': 1,
            '1': 1,
            '2': 1,
            '3': 1,
            '4': 1,
            '5': 1,
          },
          [test2]: {
            '33': 2,
            '34': 1,
            '35': 1,
            '36': 2,
            '37': 1,
            '38': 1,
            '39': 1,
            '46': 1,
            '47': 1,
            '48': 1,
            '51': 1,
            '52': 1,
          },
          [test3]: {
            '33': 4,
            '34': 1,
            '35': 1,
            '36': 4,
            '37': 1,
            '38': 1,
            '39': 2,
            '40': 1,
            '41': 1,
            '42': 1,
            '43': 1,
            '46': 2,
            '47': 1,
            '48': 1,
            '49': 1,
            '50': 1,
            '51': 2,
            '52': 2,
          },
        },
        static: {
          '6': 1,
          '7': 1,
          '8': 1,
          '9': 1,
          '10': 1,
          '11': 1,
          '12': 1,
          '13': 1,
          '14': 1,
          '15': 1,
          '53': 1,
        },
      });
    });
  });

  describe(VitestTestRunner.prototype.mutantRun.name, () => {
    it('should be able to kill a mutant', async () => {
      const runResult = await sut.mutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '50' }), mutantActivation: 'runtime', testFilter: [test3], sandboxFileName }),
      );
      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq([test3]);
      expect(runResult.nrOfTests).deep.eq(2);
      expect(runResult.failureMessage).contains('42 - 2 = 44');
    });

    it('should be able to survive after killing mutant', async () => {
      // Arrange
      await sut.mutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '50' }), mutantActivation: 'runtime', testFilter: [test3], sandboxFileName }),
      );

      // Act
      const runResult = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '48' }), // Should survive
          sandboxFileName,
          mutantActivation: 'runtime',
          testFilter: [test2],
        }),
      );

      // Assert
      assertions.expectSurvived(runResult);
      expect(runResult.nrOfTests).eq(2);
    });

    it('should be able to kill a static mutant', async () => {
      // Act
      const runResult = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '14' }), // Static mutant
          sandboxFileName,
          mutantActivation: 'static',
          testFilter: [test3],
        }),
      );

      // Assert
      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq([test3]);
      expect(runResult.failureMessage).contains('42 - 2 = undefined');
    });
  });
});
