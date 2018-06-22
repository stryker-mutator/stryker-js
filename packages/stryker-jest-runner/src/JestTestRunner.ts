import { getLogger } from 'log4js';
import { RunnerOptions, RunResult, TestRunner, RunStatus, TestResult, TestStatus } from 'stryker-api/test_runner';
import { EventEmitter } from 'events';
import JestTestAdapterFactory from './jestTestAdapters/JestTestAdapterFactory';

export default class JestTestRunner extends EventEmitter implements TestRunner {
  private log = getLogger(JestTestRunner.name);
  private jestConfig: any;
  private projectRoot: string;
  private processEnvRef: NodeJS.ProcessEnv;

  public constructor(options: RunnerOptions, processEnvRef?: NodeJS.ProcessEnv) {
    super();

    // Make sure process can be mocked by tests by passing it in the constructor
    this.processEnvRef = processEnvRef || /* istanbul ignore next */ process.env;

    // basePath will be used in future releases of Stryker as a way to define the project root
    // Default to process.cwd when basePath is not set for now, should be removed when issue is solved
    // https://github.com/stryker-mutator/stryker/issues/650
    this.projectRoot = options.strykerOptions.basePath || process.cwd();
    this.log.debug(`Project root is ${this.projectRoot}`);

    this.jestConfig = options.strykerOptions.jest.config;
    this.jestConfig.rootDir = this.projectRoot;
  }

  public async run(): Promise<RunResult> {
    this.setNodeEnv();

    const jestTestRunner = JestTestAdapterFactory.getJestTestAdapter();

    const { results } = await jestTestRunner.run(this.jestConfig, process.cwd());

    // Map the failureMessages from each testSuite to a single array then filter out empty errors
    const errorMessages = results.testResults.map((testSuite: any) => testSuite.failureMessage).filter((errorMessage: string) => errorMessage);

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

  private processTestResults(suiteResults: Array<any>): Array<TestResult> {
    const testResults: Array<TestResult> = [];

    for (let suiteResult of suiteResults) {
      for (let testResult of suiteResult.testResults) {
        testResults.push({
          name: testResult.fullName,
          status: (testResult.status === 'passed') ? TestStatus.Success : TestStatus.Failed,
          timeSpentMs: testResult.duration,
          failureMessages: testResult.failureMessages
        });
      }
    }

    return testResults;
  }
}