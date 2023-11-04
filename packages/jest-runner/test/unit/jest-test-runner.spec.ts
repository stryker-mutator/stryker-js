import path from 'path';
import { fileURLToPath, URL } from 'url';
import { createRequire } from 'module';

import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { DryRunStatus, TestStatus, CompleteDryRunResult, ErrorDryRunResult, TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';
import { INSTRUMENTER_CONSTANTS, MutantCoverage } from '@stryker-mutator/api/core';
import { Config } from '@jest/types';
import { Task } from '@stryker-mutator/util';

import { JestTestAdapter } from '../../src/jest-test-adapters/index.js';
import { JestTestRunner } from '../../src/jest-test-runner.js';
import * as producers from '../helpers/producers.js';
import { pluginTokens } from '../../src/plugin-di.js';
import { JestConfigLoader } from '../../src/config-loaders/jest-config-loader.js';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options.js';
import { JestRunResult } from '../../src/jest-run-result.js';
import { state } from '../../src/jest-plugins/messaging.cjs';
import { JestWrapper } from '../../src/utils/jest-wrapper.js';

describe(JestTestRunner.name, () => {
  const basePath = '/path/to/project/root';

  let jestTestAdapterMock: sinon.SinonStubbedInstance<JestTestAdapter>;
  let jestConfigLoaderMock: sinon.SinonStubbedInstance<JestConfigLoader>;
  let options: JestRunnerOptionsWithStrykerOptions;
  let jestRunResult: JestRunResult;
  let jestWrapperMock: sinon.SinonStubbedInstance<JestWrapper>;

  beforeEach(() => {
    options = testInjector.options as JestRunnerOptionsWithStrykerOptions;
    jestWrapperMock = sinon.createStubInstance(JestWrapper);
    jestTestAdapterMock = { run: sinon.stub() };
    jestRunResult = producers.createJestRunResult({ results: producers.createJestAggregatedResult({ testResults: [] }) });
    jestTestAdapterMock.run.resolves(jestRunResult);
    jestConfigLoaderMock = { loadConfig: sinon.stub() };
    jestConfigLoaderMock.loadConfig.resolves({});

    options.jest = {
      enableFindRelatedTests: true,
      projectType: 'custom',
    };
    options.basePath = basePath;
  });

  describe('constructor', () => {
    it('should log enabled find related tests helper message to debug if set', () => {
      options.jest.enableFindRelatedTests = true;
      createSut();
      expect(testInjector.logger.debug).calledWith(
        'Running jest with --findRelatedTests flag. Set jest.enableFindRelatedTests to false to run all tests on every mutant.',
      );
    });
    it('should log a helper message when find related tests is disabled', () => {
      options.jest.enableFindRelatedTests = false;
      createSut();
      expect(testInjector.logger.debug).calledWith(
        'Running jest without --findRelatedTests flag. Set jest.enableFindRelatedTests to true to run only relevant tests on every mutant.',
      );
    });
  });

  describe('capabilities', () => {
    it('should communicate reloadEnvironment=true', () => {
      const expectedCapabilities: TestRunnerCapabilities = { reloadEnvironment: true };
      expect(createSut().capabilities()).deep.eq(expectedCapabilities);
    });
  });

  describe('dryRun', () => {
    it('should call the run function with the provided config and the projectRoot', async () => {
      const sut = await arrangeInitializedSut();
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));

      expect(jestTestAdapterMock.run).called;
    });

    it('should set reporters to an empty array', async () => {
      const sut = await arrangeInitializedSut();
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: sinon.match({
            reporters: [],
          }),
        }),
      );
    });

    it('should always set bail = false (see https://github.com/facebook/jest/issues/11766)', async () => {
      const sut = await arrangeInitializedSut();
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off', disableBail: true }));
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: sinon.match({ bail: false }),
        }),
      );
    });

    it("should set bail = false (process is exited if we don't)", async () => {
      const sut = await arrangeInitializedSut();
      await sut.dryRun({ coverageAnalysis: 'off' });
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: sinon.match({
            bail: false,
          }),
        }),
      );
    });

    it('should trace log a message when jest is invoked', async () => {
      const sut = await arrangeInitializedSut();
      testInjector.logger.isTraceEnabled.returns(true);
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      expect(testInjector.logger.trace).calledWithMatch(/Invoking Jest with config\s.*/, sinon.match(/.*"jestConfig".*/));
    });

    it('should call the jestTestRunner run method and return a correct runResult', async () => {
      const sut = await arrangeInitializedSut();
      jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: producers.createSuccessResult() }));

      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));

      const expectedRunResult: CompleteDryRunResult = {
        status: DryRunStatus.Complete,
        tests: [
          {
            id: 'App renders without crashing',
            name: 'App renders without crashing',
            status: TestStatus.Success,
            timeSpentMs: 23,
            startPosition: { column: 4, line: 2 },
            fileName: 'foo.js',
          },
        ],
      };
      expect(result).to.deep.equal(expectedRunResult);
    });

    it('should call the jestTestRunner run method and return a skipped runResult', async () => {
      const sut = await arrangeInitializedSut();
      jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: producers.createPendingResult() }));

      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));

      const expectedRunResult: CompleteDryRunResult = {
        status: DryRunStatus.Complete,
        tests: [
          {
            id: 'App renders without crashing',
            name: 'App renders without crashing',
            status: TestStatus.Skipped,
            startPosition: undefined,
            timeSpentMs: 0,
            fileName: 'bar.js',
          },
        ],
      };

      expect(result).to.deep.equal(expectedRunResult);
    });

    it('should call the jestTestRunner run method and return a todo runResult', async () => {
      const sut = await arrangeInitializedSut();
      jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: producers.createTodoResult() }));

      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));
      const expectedRunResult: CompleteDryRunResult = {
        status: DryRunStatus.Complete,
        tests: [
          {
            id: 'App renders without crashing',
            name: 'App renders without crashing',
            status: TestStatus.Success,
            startPosition: undefined,
            timeSpentMs: 4,
            fileName: 'baz.js',
          },
          {
            id: 'App renders without crashing with children',
            name: 'App renders without crashing with children',
            status: TestStatus.Skipped,
            startPosition: undefined,
            timeSpentMs: 0,
            fileName: 'baz.js',
          },
        ],
      };
      expect(result).to.deep.equal(expectedRunResult);
    });

    it('should call the jestTestRunner run method and return a negative runResult', async () => {
      const sut = await arrangeInitializedSut();
      jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: producers.createFailResult() }));

      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));

      const expectedRunResult: CompleteDryRunResult = {
        status: DryRunStatus.Complete,
        tests: [
          {
            id: 'App render renders without crashing',
            name: 'App render renders without crashing',
            failureMessage: 'Fail message 1, Fail message 2',
            status: TestStatus.Failed,
            timeSpentMs: 2,
            fileName: 'qux.js',
            startPosition: undefined,
          },
          {
            id: 'App render renders without crashing',
            name: 'App render renders without crashing',
            failureMessage: 'Fail message 3, Fail message 4',
            status: TestStatus.Failed,
            timeSpentMs: 0,
            fileName: 'qux.js',
            startPosition: undefined,
          },
          {
            id: 'App renders without crashing',
            name: 'App renders without crashing',
            status: TestStatus.Success,
            timeSpentMs: 23,
            fileName: 'quux.js',
            startPosition: { line: 41, column: 43 },
          },
        ],
      };
      expect(result).to.deep.equal(expectedRunResult);
    });

    it('should return an error result when a runtime error occurs', async () => {
      const sut = await arrangeInitializedSut();
      const jestResult = producers.createJestAggregatedResult({
        numRuntimeErrorTestSuites: 2,
        testResults: [
          producers.createJestTestResult({
            testExecError: producers.createSerializableError({
              code: 'ENOENT',
              stack:
                'Error\n  at [eval]:1:1\n  at Script.runInThisContext (vm.js:120:20)\n  at Object.runInThisContext (vm.js:311:38)\n  at Object.<anonymous> ([eval]-wrapper:10:26)',
              message: 'test message',
              type: 'test',
            }),
          }),
        ],
      });
      jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: jestResult }));

      const result = await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));

      const expectedRunResult: ErrorDryRunResult = {
        status: DryRunStatus.Error,
        errorMessage:
          'ENOENT test message Error\n  at [eval]:1:1\n  at Script.runInThisContext (vm.js:120:20)\n  at Object.runInThisContext (vm.js:311:38)\n  at Object.<anonymous> ([eval]-wrapper:10:26)',
      };
      expect(result).to.deep.equal(expectedRunResult);
    });

    it('should override verbose, collectCoverage, testResultsProcessor, notify and bail on all loaded configs', async () => {
      const sut = await arrangeInitializedSut();
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off' }));

      expect(jestTestAdapterMock.run).calledWithMatch({
        jestConfig: sinon.match({
          bail: false,
          collectCoverage: false,
          notify: false,
          testResultsProcessor: undefined,
          verbose: false,
        }),
      });
    });

    it('should use correct fileNamesUnderTest if findRelatedTests = true', async () => {
      options.jest.enableFindRelatedTests = true;
      const sut = await arrangeInitializedSut();
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off', files: ['.stryker-tmp/sandbox2/foo.js'] }));
      expect(jestTestAdapterMock.run).calledWithExactly(
        sinon.match({
          fileNamesUnderTest: ['.stryker-tmp/sandbox2/foo.js'],
        }),
      );
    });

    it('should not set fileNamesUnderTest if findRelatedTests = false', async () => {
      options.jest.enableFindRelatedTests = false;
      const sut = await arrangeInitializedSut();
      await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'off', files: ['.stryker-tmp/sandbox2/foo.js'] }));
      expect(jestTestAdapterMock.run).calledWithExactly(
        sinon.match({
          fileNamesUnderTest: undefined,
        }),
      );
    });

    describe('coverage analysis', () => {
      it('should return the mutant coverage when coverage analysis != "off"', async () => {
        // Arrange
        const sut = await arrangeInitializedSut();
        const runTask = new Task<JestRunResult>();
        jestTestAdapterMock.run.returns(runTask.promise);
        const expectedMutantCoverage: MutantCoverage = {
          static: { 0: 3, 1: 2 },
          perTest: { 'foo should be bar': { 7: 1 }, 'baz should be qux': { 6: 1 } },
        };

        // Act
        const onGoingDryRun = sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
        state.instrumenterContext.mutantCoverage = expectedMutantCoverage;
        runTask.resolve({
          results: producers.createJestAggregatedResult({
            testResults: [],
          }),
          globalConfig: producers.createGlobalConfig(),
        });
        const result = await onGoingDryRun;

        // Assert
        assertions.expectCompleted(result);
        expect(result.mutantCoverage).deep.eq(expectedMutantCoverage);
      });

      it('should override the testEnvironment if coverage analysis != off', async () => {
        const testEnvironment = 'my-test-environment';
        options.jest.config = { testEnvironment };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({
            testEnvironment: fileURLToPath(new URL('../../src/jest-plugins/jest-environment-generic.cjs', import.meta.url)),
          }),
        });
        expect(state.jestEnvironment).eq(testEnvironment);
      });

      it('should set the set the jestEnvironment to "jest-environment-jsdom" in the messaging state when the jest environment is "jsdom"', async () => {
        options.jest.config = { testEnvironment: 'jsdom' };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));

        expect(state.jestEnvironment).eq('jest-environment-jsdom');
      });

      it('should set the set the jestEnvironment to "jest-environment-node" in the messaging state when the jest environment is "node"', async () => {
        options.jest.config = { testEnvironment: 'node' };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));

        expect(state.jestEnvironment).eq('jest-environment-node');
      });

      it('should add a set setupFile if testRunner = "jest-jasmine2"', async () => {
        options.jest.config = { testRunner: 'jest-jasmine2' };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({
            setupFilesAfterEnv: [fileURLToPath(new URL('../../src/jest-plugins/jasmine2-setup-coverage-analysis.cjs', import.meta.url))],
          }),
        });
      });

      it('should add a set setupFile if testRunner is not specified and jest version < 27', async () => {
        jestWrapperMock.getVersion.returns('26.999.999');
        options.jest.config = { testRunner: undefined };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({
            setupFilesAfterEnv: [fileURLToPath(new URL('../../src/jest-plugins/jasmine2-setup-coverage-analysis.cjs', import.meta.url))],
          }),
        });
      });

      it('should not add a set setupFile if testRunner is not specified and jest version >= 27 (circus test runner)', async () => {
        jestWrapperMock.getVersion.returns('27.0.0');
        options.jest.config = { testRunner: undefined };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({ setupFilesAfterEnv: undefined }),
        });
      });

      it('should not allow the circus test runner for coverage analysis "perTest"', async () => {
        options.jest.config = { testRunner: 'jest-circus/runner' };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({ setupFilesAfterEnv: undefined }),
        });
      });

      it('should not allow a full path to circus test runner for coverage analysis "perTest"', async () => {
        const require = createRequire(import.meta.url);
        options.jest.config = { testRunner: require.resolve('jest-circus/runner') };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({ setupFilesAfterEnv: undefined }),
        });
      });

      it('should not remove existing setup files if testRunner = "jest-jasmine2"', async () => {
        options.jest.config = { testRunner: 'jest-jasmine2', setupFilesAfterEnv: ['setup/env.js', 'setup/unit.js'] };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({
            setupFilesAfterEnv: [
              fileURLToPath(new URL('../../src/jest-plugins/jasmine2-setup-coverage-analysis.cjs', import.meta.url)),
              'setup/env.js',
              'setup/unit.js',
            ],
          }),
        });
      });

      it('should not add a setupFile if coverageAnalysis = "all"', async () => {
        options.jest.config = { testRunner: 'jest-jasmine2' };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all' }));
        // eslint-disable-next-line @typescript-eslint/prefer-destructuring
        const { jestConfig } = jestTestAdapterMock.run.getCall(0).args[0];
        expect(jestConfig).has.not.property('setupFilesAfterEnv');
      });

      it('should not add a set setupFile if testRunner = "jest-circus/runner"', async () => {
        options.jest.config = { testRunner: 'jest-circus/runner', setupFilesAfterEnv: ['setup.js'] };
        const sut = await arrangeInitializedSut();
        await sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({ setupFilesAfterEnv: ['setup.js'] }),
        });
      });

      it('should reject if coverageAnalysis = perTest and test runner is not recognized', async () => {
        options.jest.config = { testRunner: 'foo/runner' };
        const sut = await arrangeInitializedSut();
        const onGoingRun = sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        await expect(onGoingRun).rejectedWith(
          'The @stryker-mutator/jest-runner doesn\'t support coverageAnalysis "perTest" with "jestConfig.testRunner": "foo/runner". Please open an issue if you want support for this: https://github.com/stryker-mutator/stryker-js/issues',
        );
      });

      it('should reject if coverage analysis is enabled but coverage is not reported for all files', async () => {
        // Arrange
        const runTask = new Task<JestRunResult>();
        const sut = await arrangeInitializedSut();
        jestTestAdapterMock.run.returns(runTask.promise);

        // Act
        const onGoingRun = sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'perTest' }));
        state.testFilesWithStrykerEnvironment.add('foo.js');
        // mutant coverage for bar.js is missing
        runTask.resolve(
          producers.createJestRunResult({
            results: producers.createJestAggregatedResult({
              testResults: [
                producers.createJestTestResult({ testFilePath: path.resolve('foo.js') }),
                producers.createJestTestResult({ testFilePath: path.resolve('bar.js') }),
              ],
            }),
          }),
        );
        const result = await onGoingRun;

        // Assert
        assertions.expectErrored(result);
        expect(result.errorMessage).matches(/Missing coverage results for.*bar\.js/s); // exact error messages are tested in separate unit tests
      });
    });
  });

  describe('mutantRun', () => {
    it('should use correct fileNamesUnderTest if findRelatedTests = true', async () => {
      options.jest.enableFindRelatedTests = true;
      const sut = await arrangeInitializedSut();
      await sut.mutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutant({ fileName: 'foo.js' }), sandboxFileName: '.stryker-tmp/sandbox2/foo.js' }),
      );
      expect(jestTestAdapterMock.run).calledWithExactly(
        sinon.match({
          jestConfig: sinon.match.object,
          testNamePattern: undefined,
          fileNamesUnderTest: ['.stryker-tmp/sandbox2/foo.js'],
        }),
      );
    });

    it('should not set fileNamesUnderTest if findRelatedTests = false', async () => {
      options.jest.enableFindRelatedTests = false;
      const sut = await arrangeInitializedSut();
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant() }));
      expect(jestTestAdapterMock.run).calledWithExactly(
        sinon.match({
          jestConfig: sinon.match.object,
          testNamePattern: undefined,
          fileNamesUnderTest: undefined,
        }),
      );
    });

    it('should set the active mutant in environment variable', async () => {
      const sut = await arrangeInitializedSut();
      const onGoingWork = sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '25' }) }));
      expect(process.env[INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]).to.equal('25');
      await onGoingWork;
    });

    it('should reset the active mutant in environment variable', async () => {
      const sut = await arrangeInitializedSut();
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '25' }) }));
      expect(process.env[INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]).to.equal(undefined);
    });

    it('should set the node environment variable before calling jest in the dry run', async () => {
      const sut = createSut();
      jestTestAdapterMock.run.callsFake(async () => {
        expect(process.env.NODE_ENV).to.equal('test');
        return jestRunResult;
      });
      await sut.dryRun(factory.dryRunOptions());
      expect(jestTestAdapterMock.run.calledOnce).to.be.true;
    });

    it('should set the __strykerGlobalNamespace__ in globals', async () => {
      const sut = await arrangeInitializedSut();
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '25' }) }));
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: {
            globals: { __strykerGlobalNamespace__: '__stryker2__' },
          },
        }),
      );
    });

    it('should allow for other globals', async () => {
      const customConfig: Config.InitialOptions = {
        globals: {
          foo: 'bar',
        },
      };
      options.jest.config = customConfig;
      const sut = await arrangeInitializedSut();
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: '25' }) }));
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: {
            globals: { foo: 'bar' },
          },
        }),
      );
    });

    it('should set testNamePattern if testFilter is set', async () => {
      const sut = await arrangeInitializedSut();
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['foo should be bar/z', 'baz should be ba\\.z'] }));
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          testNamePattern: '(foo should be bar/z)|(baz should be ba\\\\\\.z)',
        }),
      );
    });

    it('should set bail if disableBail is passed', async () => {
      const sut = await arrangeInitializedSut();
      await sut.mutantRun(factory.mutantRunOptions({ disableBail: true }));
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: sinon.match({
            bail: false,
          }),
        }),
      );
    });

    it('should report a timeout when the hitLimit was reached', async () => {
      const result = await actMutantRun(factory.mutantRunOptions({ hitLimit: 9 }), 10);
      assertions.expectTimeout(result);
      expect(result.reason).contains('Hit limit reached (10/9)');
    });

    it('should reset the hitLimit between runs', async () => {
      const firstResult = await actMutantRun(factory.mutantRunOptions({ hitLimit: 9 }), 10);
      const secondResult = await actMutantRun(factory.mutantRunOptions({ hitLimit: undefined }), 10);
      assertions.expectTimeout(firstResult);
      assertions.expectSurvived(secondResult);
    });
  });

  function createSut() {
    return testInjector.injector
      .provideValue(pluginTokens.jestTestAdapter, jestTestAdapterMock as unknown as JestTestAdapter)
      .provideValue(pluginTokens.configLoader, jestConfigLoaderMock)
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .provideValue(pluginTokens.jestWrapper, jestWrapperMock)
      .injectClass(JestTestRunner);
  }

  async function arrangeInitializedSut() {
    const sut = createSut();
    await sut.init();
    return sut;
  }

  async function actMutantRun(option = factory.mutantRunOptions(), hitCount?: number) {
    const sut = createSut();
    await sut.init();
    jestTestAdapterMock.run.callsFake(async () => {
      state.instrumenterContext.hitCount = hitCount;
      return jestRunResult;
    });
    const result = await sut.mutantRun(option);
    return result;
  }
});
