import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { DryRunStatus, TestStatus, CompleteDryRunResult, ErrorDryRunResult } from '@stryker-mutator/api/test-runner';
import { INSTRUMENTER_CONSTANTS } from '@stryker-mutator/api/core';
import { Config } from '@jest/types';

import { JestTestAdapter } from '../../src/jest-test-adapters';
import JestTestRunner from '../../src/jest-test-runner';
import * as producers from '../helpers/producers';
import * as pluginTokens from '../../src/plugin-tokens';
import JestConfigLoader from '../../src/config-loaders/jest-config-loader';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options';

describe(JestTestRunner.name, () => {
  const basePath = '/path/to/project/root';

  let jestTestAdapterMock: sinon.SinonStubbedInstance<JestTestAdapter>;
  let jestConfigLoaderMock: sinon.SinonStubbedInstance<JestConfigLoader>;
  let processEnvMock: NodeJS.ProcessEnv;
  let options: JestRunnerOptionsWithStrykerOptions;

  beforeEach(() => {
    options = testInjector.options as JestRunnerOptionsWithStrykerOptions;
    jestTestAdapterMock = { run: sinon.stub() };
    jestTestAdapterMock.run.resolves({ results: { testResults: [] } });
    jestConfigLoaderMock = { loadConfig: sinon.stub() };
    jestConfigLoaderMock.loadConfig.resolves({});

    options.jest = {
      enableFindRelatedTests: true,
      projectType: 'custom',
    };
    options.basePath = basePath;

    processEnvMock = {
      NODE_ENV: undefined,
    };
  });

  describe('dryRun', () => {
    let sut: JestTestRunner;
    beforeEach(() => {
      sut = createSut();
    });

    it('should log the project root when constructing the JestTestRunner', () => {
      expect(testInjector.logger.debug).calledWith(`Project root is ${basePath}`);
    });

    it('should call the run function with the provided config and the projectRoot', async () => {
      await sut.dryRun({ coverageAnalysis: 'off' });

      expect(jestTestAdapterMock.run).called;
    });

    it('should set reporters to an empty array', async () => {
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
      await sut.dryRun({ coverageAnalysis: 'off' });
      expect(jestTestAdapterMock.run).calledWithMatch(
        sinon.match({
          jestConfig: sinon.match({
            bail: true,
          }),
        })
      );
    });

    it('should trace log a message when jest is invoked', async () => {
      testInjector.logger.isTraceEnabled.returns(true);
      await sut.dryRun({ coverageAnalysis: 'off' });
      expect(testInjector.logger.trace).calledWithMatch(/Invoking Jest with config\s.*/, sinon.match(/.*"jestConfig".*"projectRoot".*/));
    });

    it('should call the jestTestRunner run method and return a correct runResult', async () => {
      jestTestAdapterMock.run.resolves({ results: producers.createSuccessResult() });

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
      jestTestAdapterMock.run.resolves({ results: producers.createPendingResult() });

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
      jestTestAdapterMock.run.resolves({ results: producers.createTodoResult() });

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
      jestTestAdapterMock.run.resolves({ results: producers.createFailResult() });

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
      jestTestAdapterMock.run.resolves({ results: jestResult });

      const result = await sut.dryRun({ coverageAnalysis: 'off' });

      const expectedRunResult: ErrorDryRunResult = {
        status: DryRunStatus.Error,
        errorMessage:
          'ENOENT test message Error\n  at [eval]:1:1\n  at Script.runInThisContext (vm.js:120:20)\n  at Object.runInThisContext (vm.js:311:38)\n  at Object.<anonymous> ([eval]-wrapper:10:26)',
      };
      expect(result).to.deep.equal(expectedRunResult);
    });

    it("should set process.env.NODE_ENV to 'test' when process.env.NODE_ENV is null", async () => {
      await sut.dryRun({ coverageAnalysis: 'off' });

      expect(processEnvMock.NODE_ENV).to.equal('test');
    });

    it('should keep the value set in process.env.NODE_ENV if not null', async () => {
      processEnvMock.NODE_ENV = 'stryker';

      await sut.dryRun({ coverageAnalysis: 'off' });

      expect(processEnvMock.NODE_ENV).to.equal('stryker');
    });

    it('should override verbose, collectCoverage, testResultsProcessor, notify and bail on all loaded configs', async () => {
      await sut.dryRun({ coverageAnalysis: 'off' });

      expect(
        jestTestAdapterMock.run.calledWith({
          bail: false,
          collectCoverage: false,
          notify: false,
          testResultsProcessor: undefined,
          verbose: false,
        })
      );
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
          fileNameUnderTest: sinon.match.string,
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
