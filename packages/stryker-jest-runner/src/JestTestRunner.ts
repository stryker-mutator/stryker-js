import * as jest from 'jest';
import { getLogger } from 'stryker-api/logging';
import { RunnerOptions, RunOptions, RunResult, RunStatus, TestResult, TestRunner, TestStatus } from 'stryker-api/test_runner';
import JestTestAdapterFactory from './jestTestAdapters/JestTestAdapterFactory';

export default class JestTestRunner implements TestRunner {
  private readonly enableFindRelatedTests: boolean;
  private readonly jestConfig: jest.Configuration;
  private readonly log = getLogger(JestTestRunner.name);
  private readonly processEnvRef: NodeJS.ProcessEnv;

  public constructor(options: RunnerOptions, processEnvRef?: NodeJS.ProcessEnv) {
    // Make sure process can be mocked by tests by passing it in the constructor
    this.processEnvRef = processEnvRef || /* istanbul ignore next */ process.env;

    // Get jest configuration from stryker options and assign it to jestConfig
    this.jestConfig = options.strykerOptions.jest.config;

    // Get enableFindRelatedTests from stryker jest options or default to true
    this.enableFindRelatedTests = options.strykerOptions.jest.enableFindRelatedTests;
    if (this.enableFindRelatedTests === undefined) {
      this.enableFindRelatedTests = true;
    }

    if (this.enableFindRelatedTests) {
      this.log.debug('Running jest with --findRelatedTests flag. Set jest.enableFindRelatedTests to false to run all tests on every mutant.');
    } else {
      this.log.debug('Running jest without --findRelatedTests flag. Set jest.enableFindRelatedTests to true to run only relevant tests on every mutant.');
    }

    // basePath will be used in future releases of Stryker as a way to define the project root
    // Default to process.cwd when basePath is not set for now, should be removed when issue is solved
    // https://github.com/stryker-mutator/stryker/issues/650
    this.jestConfig.rootDir = options.strykerOptions.basePath || process.cwd();
    this.log.debug(`Project root is ${this.jestConfig.rootDir}`);
  }

  public async run(options: RunOptions): Promise<RunResult> {
    this.setNodeEnv();

    const jestTestRunner = JestTestAdapterFactory.getJestTestAdapter();

    const { results } = await jestTestRunner.run(this.jestConfig, process.cwd(), this.enableFindRelatedTests ? options.mutatedFileName : undefined);

    // Get the non-empty errorMessages from the jest RunResult, it's safe to cast to Array<string> here because we filter the empty error messages
    const errorMessages = results.testResults.map((testSuite: jest.TestResult) => testSuite.failureMessage).filter(errorMessage => (errorMessage)) as string[];

    return {
      errorMessages,
      status: (results.numRuntimeErrorTestSuites > 0) ? RunStatus.Error : RunStatus.Complete,
      tests: this.processTestResults(results.testResults)
    };
  }

  private determineTestResultStatus(status: string) {
    switch (status) {
      case 'passed':
        return TestStatus.Success;
      case 'pending':
        return TestStatus.Skipped;
      default:
        return TestStatus.Failed;
    }
  }

  private processTestResults(suiteResults: jest.TestResult[]): TestResult[] {
    const testResults: TestResult[] = [];

    for (const suiteResult of suiteResults) {
      for (const testResult of suiteResult.testResults) {
        testResults.push({
          failureMessages: testResult.failureMessages,
          name: testResult.fullName,
          status: this.determineTestResultStatus(testResult.status),
          timeSpentMs: testResult.duration ? testResult.duration : 0
        });
      }
    }

    return testResults;
  }

  private setNodeEnv() {
    // Jest CLI will set process.env.NODE_ENV to 'test' when it's null, do the same here
    // https://github.com/facebook/jest/blob/master/packages/jest-cli/bin/jest.js#L12-L14
    if (!this.processEnvRef.NODE_ENV) {
      this.processEnvRef.NODE_ENV = 'test';
    }
  }
}
