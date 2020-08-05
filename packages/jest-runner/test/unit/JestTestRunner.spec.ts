import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { DryRunOptions, DryRunStatus, TestStatus, CompleteDryRunResult, ErrorDryRunResult } from '@stryker-mutator/api/test_runner2';

import { JestTestAdapter } from '../../src/jestTestAdapters';
import JestTestRunner from '../../src/JestTestRunner';
import * as producers from '../helpers/producers';
import { processEnvToken, jestTestAdapterToken, configLoaderToken } from '../../src/pluginTokens';
import JestConfigLoader from '../../src/configLoaders/JestConfigLoader';

describe('JestTestRunner', () => {
  const basePath = '/path/to/project/root';
  const dryRunOptions: DryRunOptions = { timeout: 0, coverageAnalysis: 'off' };

  let jestTestAdapterMock: sinon.SinonStubbedInstance<JestTestAdapter>;
  let jestConfigLoaderMock: sinon.SinonStubbedInstance<JestConfigLoader>;
  let jestTestRunner: JestTestRunner;
  let processEnvMock: NodeJS.ProcessEnv;

  beforeEach(() => {
    jestTestAdapterMock = { run: sinon.stub() };
    jestTestAdapterMock.run.resolves({ results: { testResults: [] } });
    jestConfigLoaderMock = { loadConfig: sinon.stub() };
    jestConfigLoaderMock.loadConfig.resolves({});

    testInjector.options.jest = { config: { property: 'value' } };
    testInjector.options.basePath = basePath;

    processEnvMock = {
      NODE_ENV: undefined,
    };

    jestTestRunner = testInjector.injector
      .provideValue(processEnvToken, processEnvMock)
      .provideValue(jestTestAdapterToken, (jestTestAdapterMock as unknown) as JestTestAdapter)
      .provideValue(configLoaderToken, jestConfigLoaderMock)
      .injectClass(JestTestRunner);
  });

  it('should log the project root when constructing the JestTestRunner', () => {
    expect(testInjector.logger.debug).calledWith(`Project root is ${basePath}`);
  });

  it('should call the run function with the provided config and the projectRoot', async () => {
    await jestTestRunner.dryRun(dryRunOptions);

    expect(jestTestAdapterMock.run).called;
  });

  it('should call the jestTestRunner run method and return a correct runResult', async () => {
    jestTestAdapterMock.run.resolves({ results: producers.createSuccessResult() });

    const result = await jestTestRunner.dryRun(dryRunOptions);

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

    const result = await jestTestRunner.dryRun(dryRunOptions);

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

    const result = await jestTestRunner.dryRun(dryRunOptions);
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

    const result = await jestTestRunner.dryRun(dryRunOptions);

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

    const result = await jestTestRunner.dryRun(dryRunOptions);

    const expectedRunResult: ErrorDryRunResult = {
      status: DryRunStatus.Error,
      errorMessage:
        'ENOENT test message Error\n  at [eval]:1:1\n  at Script.runInThisContext (vm.js:120:20)\n  at Object.runInThisContext (vm.js:311:38)\n  at Object.<anonymous> ([eval]-wrapper:10:26)',
    };
    expect(result).to.deep.equal(expectedRunResult);
  });

  it("should set process.env.NODE_ENV to 'test' when process.env.NODE_ENV is null", async () => {
    await jestTestRunner.dryRun(dryRunOptions);

    expect(processEnvMock.NODE_ENV).to.equal('test');
  });

  it('should keep the value set in process.env.NODE_ENV if not null', async () => {
    processEnvMock.NODE_ENV = 'stryker';

    await jestTestRunner.dryRun(dryRunOptions);

    expect(processEnvMock.NODE_ENV).to.equal('stryker');
  });

  it('should override verbose, collectCoverage, testResultsProcessor, notify and bail on all loaded configs', async () => {
    await jestTestRunner.dryRun(dryRunOptions);

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
