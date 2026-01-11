import path from 'path';

import {
  factory,
  assertions,
  testInjector,
  TempTestDirectorySandbox,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { TestStatus } from '@stryker-mutator/api/test-runner';

import {
  createVitestTestRunnerFactory,
  VitestTestRunner,
} from '../../src/vitest-test-runner.js';
import { VitestRunnerOptionsWithStrykerOptions } from '../../src/vitest-runner-options-with-stryker-options.js';
import { createVitestRunnerOptions } from '../util/factories.js';

describe('VitestRunner integration', () => {
  let sut: VitestTestRunner;
  let sandbox: TempTestDirectorySandbox;
  let options: VitestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    sut = testInjector.injector.injectFunction(
      createVitestTestRunnerFactory('__stryker2__'),
    );
    options = testInjector.options as VitestRunnerOptionsWithStrykerOptions;
    options.vitest = createVitestRunnerOptions({ related: false });
  });

  afterEach(async () => {
    await sut.dispose();
    await sandbox.dispose();
  });

  describe('using the simple-project project', () => {
    const test1 = 'tests/add.spec.ts#add should be able to add two numbers';
    const test2 =
      'tests/add.spec.ts#add should be able to add a negative number';
    const test3 = 'tests/math.spec.ts#math should be able negate a number';
    const test4 =
      'tests/math.spec.ts#math should be able to add one to a number';
    const test5 =
      'tests/math.spec.ts#math should be able to recognize a negative number';
    const test6 = 'tests/pi.spec.ts#pi should be 3.14';
    let sandboxFileName: string;

    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('simple-project');
      await sandbox.init();
      sandboxFileName = path.resolve(sandbox.tmpDir, 'math.ts');
    });

    describe(VitestTestRunner.prototype.dryRun.name, () => {
      beforeEach(async () => {
        await sut.init();
      });

      it('should run the specs', async () => {
        const runResult = await sut.dryRun(factory.dryRunOptions());
        assertions.expectCompleted(runResult);
        assertions.expectTestResults(runResult, [
          {
            id: test1,
            fileName: path.resolve('tests/add.spec.ts'),
            name: 'add should be able to add two numbers',
            status: TestStatus.Success,
          },
          {
            id: test2,
            fileName: path.resolve('tests/add.spec.ts'),
            name: 'add should be able to add a negative number',
            status: TestStatus.Success,
          },
          {
            id: test3,
            fileName: path.resolve('tests/math.spec.ts'),
            name: 'math should be able negate a number',
            status: TestStatus.Success,
          },
          {
            id: test4,
            fileName: path.resolve('tests/math.spec.ts'),
            name: 'math should be able to add one to a number',
            status: TestStatus.Success,
          },
          {
            id: test5,
            fileName: path.resolve('tests/math.spec.ts'),
            name: 'math should be able to recognize a negative number',
            status: TestStatus.Success,
          },
          {
            id: test6,
            fileName: path.resolve('tests/pi.spec.ts'),
            name: 'pi should be 3.14',
            status: TestStatus.Success,
          },
        ]);
      });

      it('should report mutant coverage', async () => {
        const runResult = await sut.dryRun(factory.dryRunOptions());
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
              '1': 1,
              '2': 1,
            },
            [test3]: {
              '5': 1,
              '6': 1,
            },
            [test4]: {
              '3': 1,
              '4': 1,
            },
            [test5]: {
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
        await sut.init();
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '2' }),
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: [test1],
          }),
        );
        assertions.expectKilled(runResult);
        expect(runResult.killedBy).deep.eq([test1]);
      });

      it('should bail after the first failing test', async () => {
        await sut.init();
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '2' }),
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: [test1, test2], // tests both kill the mutant
          }),
        );
        assertions.expectKilled(runResult);
        expect(runResult.nrOfTests).deep.eq(1);
        expect(runResult.killedBy).deep.eq([test1]);
      });

      it('should report all killing tests if disableBail is enabled', async () => {
        options.disableBail = true;
        await sut.init();
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '2' }),
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: [test1, test2], // tests both kill the mutant
          }),
        );
        assertions.expectKilled(runResult);
        expect(runResult.nrOfTests).deep.eq(2);
        expect(runResult.killedBy).deep.eq([test1, test2]);
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
          }),
        );

        // Act
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '11' }), // Should survive
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: [test6],
          }),
        );

        // Assert
        assertions.expectSurvived(runResult);
        expect(runResult.nrOfTests).eq(1);
      });

      it('should be able to kill a static mutant', async () => {
        // Act
        await sut.init();
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '0' }), // Static mutant
            sandboxFileName,
            mutantActivation: 'static',
            testFilter: [test6],
          }),
        );

        // Assert
        assertions.expectKilled(runResult);
        expect(runResult.killedBy).deep.eq([test6]);
        expect(runResult.failureMessage).contains('expected 2.86 to be 3.14');
      });

      it('should be able to reload the environment after a static mutant is tested', async () => {
        // Arrange
        await sut.init();
        await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '0' }), // Pollute the environment with a static mutant
            sandboxFileName,
            mutantActivation: 'static',
          }),
        );

        // Act
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '11' }), // Should survive
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: undefined, // no test filter, so test5 is also executed, the one that kills the static mutant
          }),
        );

        // Assert
        assertions.expectSurvived(runResult);
      });

      it('should not be able to kill a static mutant when mutantActivation is runTime', async () => {
        // Act
        await sut.init();
        const runResult = await sut.mutantRun(
          factory.mutantRunOptions({
            activeMutant: factory.mutant({ id: '0' }), // Static mutant
            sandboxFileName,
            mutantActivation: 'runtime',
            testFilter: [test6],
          }),
        );

        // Assert
        assertions.expectSurvived(runResult);
      });

      it('mutant run with single filter should only run 1 test', async () => {
        await sut.init();
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
      const runResult = await sut.dryRun(factory.dryRunOptions());

      assertions.expectCompleted(runResult);
      expect(runResult.tests).to.have.lengthOf(1);
      expect(runResult.tests[0].name).eq(
        'math should be able to add two numbers',
      );
    });

    it('should load custom vitest config when config file is set', async () => {
      options.vitest.configFile = 'vitest.only.addOne.config.ts';

      await sut.init();
      const runResult = await sut.dryRun(factory.dryRunOptions());

      assertions.expectCompleted(runResult);
      expect(runResult.tests).to.have.lengthOf(1);
      expect(runResult.tests[0].name).eq(
        'math should be able to add one to a number',
      );
    });
  });

  describe('using a project using workspaces', () => {
    let fooTestId: string;
    let barTestId: string;

    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('workspaces');
      await sandbox.init();
      fooTestId = 'packages/foo/src/math.spec.js#min should min 44, 2 = 42';
      barTestId = 'packages/bar/src/math.spec.js#add should add 40, 2 = 42';
    });

    it('should report mutant coverage', async () => {
      await sut.init();
      const runResult = await sut.dryRun(factory.dryRunOptions());
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
          sandboxFileName: path.resolve(
            sandbox.tmpDir,
            'packages',
            'bar',
            'src',
            'math.js',
          ),
        }),
      );
      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq([barTestId]);
    });
  });

  describe('using a project with tests without properly awaited assertions', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('async-failure');
      await sandbox.init();
    });

    async function actErroredMutant() {
      await sut.init();
      return sut.mutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '1' }) }),
      );
    }

    // See https://github.com/stryker-mutator/stryker-js/issues/4306
    it('should be able to report an ErrorResult', async () => {
      const runResult = await actErroredMutant();
      assertions.expectErrored(runResult);
      expect(runResult.errorMessage).contains(
        'An error occurred outside of a test run',
      );
    });

    it('should be able recover from an error result', async () => {
      await actErroredMutant();
      const runResult = await sut.mutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '3' }) }),
      );
      assertions.expectSurvived(runResult);
    });
  });

  // See https://github.com/stryker-mutator/stryker-js/issues/4257
  describe('using a project using "--dir <path>"', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('deep-project');
      await sandbox.init();
    });

    it('should be able to report an ErrorResult', async () => {
      options.vitest.dir = 'packages';
      await sut.init();
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(runResult.tests).lengthOf(1);
      assertions.expectTestResults(runResult, [
        {
          id: 'packages/app/src/math.spec.js#math should be 5 for add(2, 3)',
          status: TestStatus.Success,
        },
      ]);
    });
  });

  describe('using vi.mock to mock a module', () => {
    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('vi-mock');
      await sandbox.init();
    });

    it('should be able to mock a module', async () => {
      await sut.init();
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(runResult.tests).lengthOf(3);
      assertions.expectTestResults(runResult, [
        {
          id: 'components/Counter.test.tsx#Counter increments',
          status: TestStatus.Success,
        },
        {
          id: "components/Product.test.tsx#Product doesn't render the discount when 0",
          status: TestStatus.Success,
        },
        {
          id: 'components/Product.test.tsx#Product should render the discount',
          status: TestStatus.Success,
        },
      ]);
    });
  });

  // Vitest fixtures (test.extend) require hooks like beforeEach to use object destructuring,
  // e.g. ({ task }) => {} instead of (test) => {}, otherwise Vitest throws an error.
  describe('using vitest fixtures', () => {
    const test1 =
      'tests/math-with-fixtures.spec.ts#math with fixtures should be able to add two numbers using fixture';
    const test2 =
      'tests/math-with-fixtures.spec.ts#math with fixtures should be able to add negative numbers using fixture';

    beforeEach(async () => {
      sandbox = new TempTestDirectorySandbox('vitest-fixtures');
      await sandbox.init();
    });

    it('should run tests that use vitest fixtures', async () => {
      await sut.init();
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(runResult.tests).lengthOf(2);
      assertions.expectTestResults(runResult, [
        {
          id: test1,
          status: TestStatus.Success,
        },
        {
          id: test2,
          status: TestStatus.Success,
        },
      ]);
    });

    it('should report mutant coverage for tests using fixtures', async () => {
      await sut.init();
      const runResult = await sut.dryRun(factory.dryRunOptions());
      assertions.expectCompleted(runResult);
      expect(runResult.mutantCoverage).to.deep.include({
        perTest: {
          [test1]: {
            '1': 1,
            '2': 1,
          },
          [test2]: {
            '1': 1,
            '2': 1,
          },
        },
      });
    });

    it('should be able to kill a mutant in fixture-based tests', async () => {
      await sut.init();
      const runResult = await sut.mutantRun(
        factory.mutantRunOptions({
          activeMutant: factory.mutant({ id: '2' }),
          sandboxFileName: path.resolve(sandbox.tmpDir, 'math.ts'),
          mutantActivation: 'runtime',
          testFilter: [test1],
        }),
      );
      assertions.expectKilled(runResult);
      expect(runResult.killedBy).deep.eq([test1]);
    });
  });
});
