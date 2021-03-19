import path from 'path';

import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { DryRunStatus, TestStatus, CompleteDryRunResult, ErrorDryRunResult } from '@stryker-mutator/api/test-runner';
import { INSTRUMENTER_CONSTANTS, MutantCoverage } from '@stryker-mutator/api/core';
import { Config } from '@jest/types';

import { Task } from '@stryker-mutator/util';

import { JestTestAdapter } from '../../src/jest-test-adapters';
import { JestTestRunner } from '../../src/jest-test-runner';
import * as producers from '../helpers/producers';
import * as pluginTokens from '../../src/plugin-tokens';
import { JestConfigLoader } from '../../src/config-loaders/jest-config-loader';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options';
import { JestRunResult } from '../../src/jest-run-result';
import { state } from '../../src/messaging';

describe(JestTestRunner.name, () => {
  const basePath = '/path/to/project/root';

  let jestTestAdapterMock: sinon.SinonStubbedInstance<JestTestAdapter>;
  let jestConfigLoaderMock: sinon.SinonStubbedInstance<JestConfigLoader>;
  let processEnvMock: NodeJS.ProcessEnv;
  let options: JestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    options = testInjector.options as JestRunnerOptionsWithStrykerOptions;
    jestTestAdapterMock = { run: sinon.stub() };
    jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: producers.createJestAggregatedResult({ testResults: [] }) }));
    jestConfigLoaderMock = { loadConfig: sinon.stub() };
    jestConfigLoaderMock.loadConfig.resolves({});

    options.jest = {
      enableFindRelatedTests: true,
      projectType: 'custom',
      enableBail: true,
    };
    options.basePath = basePath;

    processEnvMock = {
      NODE_ENV: undefined,
    };
  });

  describe('constructor', () => {
    it('should log enabled find related tests helper message to debug if set', () => {
      options.jest.enableFindRelatedTests = true;
      createSut();
      expect(testInjector.logger.debug).calledWith(
        'Running jest with --findRelatedTests flag. Set jest.enableFindRelatedTests to false to run all tests on every mutant.'
      );
    });
    it('should log a helper message when find related tests is disabled', () => {
      options.jest.enableFindRelatedTests = false;
      createSut();
      expect(testInjector.logger.debug).calledWith(
        'Running jest without --findRelatedTests flag. Set jest.enableFindRelatedTests to true to run only relevant tests on every mutant.'
      );
    });
  });

  describe('dryRun', () => {
    it('should call the run function with the provided config and the projectRoot', async () => {
      const sut = createSut();
      await sut.dryRun({ coverageAnalysis: 'off' });

      expect(jestTestAdapterMock.run).called;
    });

    it('should set reporters to an empty array', async () => {
      const sut = createSut();
      await sut.dryRun({ coverageAnalysis: 'off' });
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: sinon.match({
            reporters: [],
          }),
        })
      );
    });

    it('should set bail = true', async () => {
      const sut = createSut();
      await sut.dryRun({ coverageAnalysis: 'off' });
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: sinon.match({
            bail: true,
          }),
        })
      );
    });

    it('should set bail = false when enableBail is false', async () => {
      options.jest.enableBail = false;
      const sut = createSut();
      await sut.dryRun({ coverageAnalysis: 'off' });
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: sinon.match({
            bail: false,
          }),
        })
      );
    });

    it('should trace log a message when jest is invoked', async () => {
      const sut = createSut();
      testInjector.logger.isTraceEnabled.returns(true);
      await sut.dryRun({ coverageAnalysis: 'off' });
      expect(testInjector.logger.trace).calledWithMatch(/Invoking Jest with config\s.*/, sinon.match(/.*"jestConfig".*"projectRoot".*/));
    });

    it('should call the jestTestRunner run method and return a correct runResult', async () => {
      const sut = createSut();
      jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: producers.createSuccessResult() }));

      const result = await sut.dryRun({ coverageAnalysis: 'off' });

      const expectedRunResult: CompleteDryRunResult = {
        status: DryRunStatus.Complete,
        tests: [
          {
            id: 'App renders without crashing',
            name: 'App renders without crashing',
            status: TestStatus.Success,
            timeSpentMs: 23,
          },
        ],
      };
      expect(result).to.deep.equal(expectedRunResult);
    });

    it('should call the jestTestRunner run method and return a skipped runResult', async () => {
      const sut = createSut();
      jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: producers.createPendingResult() }));

      const result = await sut.dryRun({ coverageAnalysis: 'off' });

      const expectedRunResult: CompleteDryRunResult = {
        status: DryRunStatus.Complete,
        tests: [
          {
            id: 'App renders without crashing',
            name: 'App renders without crashing',
            status: TestStatus.Skipped,
            timeSpentMs: 0,
          },
        ],
      };

      expect(result).to.deep.equal(expectedRunResult);
    });

    it('should call the jestTestRunner run method and return a todo runResult', async () => {
      const sut = createSut();
      jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: producers.createTodoResult() }));

      const result = await sut.dryRun({ coverageAnalysis: 'off' });
      const expectedRunResult: CompleteDryRunResult = {
        status: DryRunStatus.Complete,
        tests: [
          {
            id: 'App renders without crashing',
            name: 'App renders without crashing',
            status: TestStatus.Success,
            timeSpentMs: 4,
          },
          {
            id: 'App renders without crashing with children',
            name: 'App renders without crashing with children',
            status: TestStatus.Skipped,
            timeSpentMs: 0,
          },
        ],
      };
      expect(result).to.deep.equal(expectedRunResult);
    });

    it('should call the jestTestRunner run method and return a negative runResult', async () => {
      const sut = createSut();
      jestTestAdapterMock.run.resolves(producers.createJestRunResult({ results: producers.createFailResult() }));

      const result = await sut.dryRun({ coverageAnalysis: 'off' });

      const expectedRunResult: CompleteDryRunResult = {
        status: DryRunStatus.Complete,
        tests: [
          {
            id: 'App render renders without crashing',
            name: 'App render renders without crashing',
            failureMessage: 'Fail message 1, Fail message 2',
            status: TestStatus.Failed,
            timeSpentMs: 2,
          },
          {
            id: 'App render renders without crashing',
            name: 'App render renders without crashing',
            failureMessage: 'Fail message 3, Fail message 4',
            status: TestStatus.Failed,
            timeSpentMs: 0,
          },
          {
            id: 'App renders without crashing',
            name: 'App renders without crashing',
            status: TestStatus.Success,
            timeSpentMs: 23,
          },
        ],
      };
      expect(result).to.deep.equal(expectedRunResult);
    });

    it('should return an error result when a runtime error occurs', async () => {
      const sut = createSut();
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

      const result = await sut.dryRun({ coverageAnalysis: 'off' });

      const expectedRunResult: ErrorDryRunResult = {
        status: DryRunStatus.Error,
        errorMessage:
          'ENOENT test message Error\n  at [eval]:1:1\n  at Script.runInThisContext (vm.js:120:20)\n  at Object.runInThisContext (vm.js:311:38)\n  at Object.<anonymous> ([eval]-wrapper:10:26)',
      };
      expect(result).to.deep.equal(expectedRunResult);
    });

    it("should set process.env.NODE_ENV to 'test' when process.env.NODE_ENV is null", async () => {
      const sut = createSut();
      await sut.dryRun({ coverageAnalysis: 'off' });

      expect(processEnvMock.NODE_ENV).to.equal('test');
    });

    it('should keep the value set in process.env.NODE_ENV if not null', async () => {
      const sut = createSut();
      processEnvMock.NODE_ENV = 'stryker';

      await sut.dryRun({ coverageAnalysis: 'off' });

      expect(processEnvMock.NODE_ENV).to.equal('stryker');
    });

    it('should override verbose, collectCoverage, testResultsProcessor, notify and bail on all loaded configs', async () => {
      const sut = createSut();
      await sut.dryRun({ coverageAnalysis: 'off' });

      expect(jestTestAdapterMock.run).calledWithMatch({
        jestConfig: sinon.match({
          bail: true,
          collectCoverage: false,
          notify: false,
          testResultsProcessor: undefined,
          verbose: false,
        }),
      });
    });

    describe('coverage analysis', () => {
      it('should handle mutant coverage when coverage analysis != "off"', async () => {
        // Arrange
        const sut = createSut();
        const runTask = new Task<JestRunResult>();
        jestTestAdapterMock.run.returns(runTask.promise);

        // Act
        const onGoingDryRun = sut.dryRun({ coverageAnalysis: 'all' });
        state.handleMutantCoverage('foo.js', { static: { 0: 2 }, perTest: { 'foo should be bar': { 3: 1 } } });
        state.handleMutantCoverage('bar.js', { static: { 0: 3, 1: 2 }, perTest: { 'foo should be bar': { 7: 1 }, 'baz should be qux': { 6: 1 } } });
        runTask.resolve({
          results: producers.createJestAggregatedResult({
            testResults: [
              producers.createJestTestResult({ testFilePath: path.resolve('foo.js') }),
              producers.createJestTestResult({ testFilePath: path.resolve('bar.js') }),
            ],
          }),
          globalConfig: producers.createGlobalConfig(),
        });
        const result = await onGoingDryRun;

        // Assert
        assertions.expectCompleted(result);
        const expectedMutantCoverage: MutantCoverage = {
          perTest: {
            'foo should be bar': { 3: 1, 7: 1 },
            'baz should be qux': { 6: 1 },
          },
          static: { 0: 5, 1: 2 },
        };
        expect(result.mutantCoverage).deep.eq(expectedMutantCoverage);
      });

      it('should remove the coverage handler afterwards', async () => {
        const sut = createSut();
        const resetSpy = sinon.spy(state, 'resetMutantCoverageHandler');
        await sut.dryRun({ coverageAnalysis: 'perTest' });
        expect(resetSpy).called;
      });

      Object.entries({
        node: require.resolve('../../src/jest-plugins/jest-environment-node'),
        'jest-environment-node': require.resolve('../../src/jest-plugins/jest-environment-node'),
        jsdom: require.resolve('../../src/jest-plugins/jest-environment-jsdom'),
        'jsdom-sixteen': require.resolve('../../src/jest-plugins/jest-environment-jsdom-sixteen'),
      }).forEach(([testEnvironment, expectedOverride]) => {
        it(`should override the {testEnvironment: "${testEnvironment}"} if coverage analysis != off`, async () => {
          options.jest.config = { testEnvironment };
          const sut = createSut();
          await sut.dryRun({ coverageAnalysis: 'all' });
          expect(jestTestAdapterMock.run).calledWithMatch({
            jestConfig: sinon.match({ testEnvironment: expectedOverride }),
          });
        });
      });

      it('should add a set setupFile if testRunner = "jest-jasmine2"', async () => {
        options.jest.config = { testRunner: 'jest-jasmine2' };
        const sut = createSut();
        await sut.dryRun({ coverageAnalysis: 'perTest' });
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({ setupFilesAfterEnv: [require.resolve('../../src/jest-plugins/jasmine2-setup-coverage-analysis')] }),
        });
      });

      it('should not remove existing setup files if testRunner = "jest-jasmine2"', async () => {
        options.jest.config = { testRunner: 'jest-jasmine2', setupFilesAfterEnv: ['setup/env.js', 'setup/unit.js'] };
        const sut = createSut();
        await sut.dryRun({ coverageAnalysis: 'perTest' });
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({
            setupFilesAfterEnv: [require.resolve('../../src/jest-plugins/jasmine2-setup-coverage-analysis'), 'setup/env.js', 'setup/unit.js'],
          }),
        });
      });

      it('should not add a setupFile if coverageAnalysis = "all"', async () => {
        options.jest.config = { testRunner: 'jest-jasmine2' };
        const sut = createSut();
        await sut.dryRun({ coverageAnalysis: 'all' });
        const { jestConfig } = jestTestAdapterMock.run.getCall(0).args[0];
        expect(jestConfig).has.not.property('setupFilesAfterEnv');
      });

      it('should not add a set setupFile if testRunner = "jest-circus/runner"', async () => {
        options.jest.config = { testRunner: 'jest-circus/runner', setupFilesAfterEnv: ['setup.js'] };
        const sut = createSut();
        await sut.dryRun({ coverageAnalysis: 'perTest' });
        expect(jestTestAdapterMock.run).calledWithMatch({
          jestConfig: sinon.match({ setupFilesAfterEnv: ['setup.js'] }),
        });
      });

      it('should reject if coverageAnalysis = perTest and test runner is not recognized', async () => {
        options.jest.config = { testRunner: 'foo/runner' };
        const sut = createSut();
        const onGoingRun = sut.dryRun({ coverageAnalysis: 'perTest' });
        await expect(onGoingRun).rejectedWith(
          'The @stryker-mutator/jest-runner doesn\'t support coverageAnalysis "perTest" with "jestConfig.testRunner": "foo/runner". Please open an issue if you want support for this: https://github.com/stryker-mutator/stryker-js/issues'
        );
      });

      it('should reject if coverage analysis is enabled but coverage is not reported for all files', async () => {
        // Arrange
        const runTask = new Task<JestRunResult>();
        const sut = createSut();
        jestTestAdapterMock.run.returns(runTask.promise);

        // Act
        const onGoingRun = sut.dryRun({ coverageAnalysis: 'perTest' });
        state.handleMutantCoverage(path.resolve('foo.js'), { perTest: {}, static: {} });
        // mutant coverage for bar.js is missing
        runTask.resolve(
          producers.createJestRunResult({
            results: producers.createJestAggregatedResult({
              testResults: [
                producers.createJestTestResult({ testFilePath: path.resolve('foo.js') }),
                producers.createJestTestResult({ testFilePath: path.resolve('bar.js') }),
              ],
            }),
          })
        );
        const result = await onGoingRun;

        // Assert
        assertions.expectErrored(result);
        expect(result.errorMessage).matches(/Missing coverage results for.*bar\.js/s); // exact error messages are tested in separate unit tests
      });
    });
  });

  describe('mutantRun', () => {
    it('should use correct fileUnderTest if findRelatedTests = true', async () => {
      options.jest.enableFindRelatedTests = true;
      const sut = createSut();
      await sut.mutantRun(
        factory.mutantRunOptions({ activeMutant: factory.mutant({ fileName: 'foo.js' }), sandboxFileName: '.stryker-tmp/sandbox2/foo.js' })
      );
      expect(jestTestAdapterMock.run).calledWithExactly(
        sinon.match({
          jestConfig: sinon.match.object,
          projectRoot: sinon.match.string,
          testNamePattern: undefined,
          fileNameUnderTest: '.stryker-tmp/sandbox2/foo.js',
        })
      );
    });

    it('should not set fileUnderTest if findRelatedTests = false', async () => {
      options.jest.enableFindRelatedTests = false;
      const sut = createSut();
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant() }));
      expect(jestTestAdapterMock.run).calledWithExactly(
        sinon.match({
          jestConfig: sinon.match.object,
          projectRoot: sinon.match.string,
          testNamePattern: undefined,
          fileNameUnderTest: undefined,
        })
      );
    });

    it('should set the active mutant in environment variable', async () => {
      const sut = createSut();
      const onGoingWork = sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 25 }) }));
      expect(process.env[INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]).to.equal('25');
      await onGoingWork;
    });

    it('should reset the active mutant in environment variable', async () => {
      const sut = createSut();
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 25 }) }));
      expect(process.env[INSTRUMENTER_CONSTANTS.ACTIVE_MUTANT_ENV_VARIABLE]).to.equal(undefined);
    });

    it('should set the __strykerGlobalNamespace__ in globals', async () => {
      const sut = createSut();
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 25 }) }));
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: {
            globals: { __strykerGlobalNamespace__: '__stryker2__' },
          },
        })
      );
    });

    it('should allow for other globals', async () => {
      const customConfig: Config.InitialOptions = {
        globals: {
          foo: 'bar',
        },
      };
      options.jest.config = customConfig;
      const sut = createSut();
      await sut.mutantRun(factory.mutantRunOptions({ activeMutant: factory.mutant({ id: 25 }) }));
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: {
            globals: { foo: 'bar' },
          },
        })
      );
    });

    it('should set testNamePattern if testFilter is set', async () => {
      const sut = createSut();
      await sut.mutantRun(factory.mutantRunOptions({ testFilter: ['foo should be bar/z', 'baz should be ba\\.z'] }));
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          testNamePattern: '(foo should be bar/z)|(baz should be ba\\\\\\.z)',
        })
      );
    });
  });

  function createSut() {
    return testInjector.injector
      .provideValue(pluginTokens.processEnv, processEnvMock)
      .provideValue(pluginTokens.jestTestAdapter, (jestTestAdapterMock as unknown) as JestTestAdapter)
      .provideValue(pluginTokens.configLoader, jestConfigLoaderMock)
      .provideValue(pluginTokens.globalNamespace, '__stryker2__' as const)
      .injectClass(JestTestRunner);
  }
});
