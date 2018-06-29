import { getLogger } from 'log4js';
import { RunnerOptions, RunResult, TestRunner, RunStatus, TestResult, TestStatus } from 'stryker-api/test_runner';
import { EventEmitter } from 'events';
import * as jest from 'jest';
import JestTestAdapterFactory from './jestTestAdapters/JestTestAdapterFactory';

export default class JestTestRunner extends EventEmitter implements TestRunner {
  private log = getLogger(JestTestRunner.name);
  private jestConfig: jest.Configuration;
  private processEnvRef: NodeJS.ProcessEnv;

  public constructor(options: RunnerOptions, processEnvRef?: NodeJS.ProcessEnv) {
    super();

    // Make sure process can be mocked by tests by passing it in the constructor
    this.processEnvRef = processEnvRef || /* istanbul ignore next */ process.env;

    // Get jest configuration from stryker options and assign it to jestConfig
    this.jestConfig = options.strykerOptions.jest.config;

    // basePath will be used in future releases of Stryker as a way to define the project root
    // Default to process.cwd when basePath is not set for now, should be removed when issue is solved
    // https://github.com/stryker-mutator/stryker/issues/650
    this.jestConfig.rootDir = options.strykerOptions.basePath || process.cwd();
    this.log.debug(`Project root is ${this.jestConfig.rootDir}`);
  }

  public async run(): Promise<RunResult> {
    this.setNodeEnv();

    const jestTestRunner = JestTestAdapterFactory.getJestTestAdapter();

    const { results } = await jestTestRunner.run(this.jestConfig, process.cwd());

    // Get the non-empty errorMessages from the jest RunResult, it's safe to cast to Array<string> here because we filter the empty error messages
    const errorMessages = results.testResults.map((testSuite: jest.TestResult) => testSuite.failureMessage).filter(errorMessage => (errorMessage)) as Array<string>;

    return {
      tests: this.processTestResults(results.testResults),
      status: (results.numRuntimeErrorTestSuites > 0) ? RunStatus.Error : RunStatus.Complete,
      errorMessages
    };
  }

  private setNodeEnv() {
    // Jest CLI will set process.env.NODE_ENV to 'test' when it's null, do the same here
    // https://github.com/facebook/jest/blob/master/packages/jest-cli/bin/jest.js#L12-L14
    if (!this.processEnvRef.NODE_ENV) {
      this.processEnvRef.NODE_ENV = 'test';
    }
  }

  private processTestResults(suiteResults: Array<jest.TestResult>): Array<TestResult> {
    const testResults: Array<TestResult> = [];

    for (let suiteResult of suiteResults) {
      for (let testResult of suiteResult.testResults) {
        testResults.push({
          name: testResult.fullName,
          status: (testResult.status === 'passed') ? TestStatus.Success : TestStatus.Failed,
          timeSpentMs: testResult.duration ? testResult.duration : 0,
          failureMessages: testResult.failureMessages
        });
      }
    }

    return testResults;
  }
}