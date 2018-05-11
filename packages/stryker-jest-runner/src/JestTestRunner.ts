import { getLogger } from 'log4js';
import { RunnerOptions, RunResult, TestRunner, RunStatus, TestResult, TestStatus } from 'stryker-api/test_runner';
import { EventEmitter } from 'events';
import JestTestAdapterFactory from './jestTestAdapters/JestTestAdapterFactory';

export default class JestTestRunner extends EventEmitter implements TestRunner {
  private log = getLogger(JestTestRunner.name);
  private jestConfig: any;
  private projectRoot: string;

  public constructor(options: RunnerOptions) {
    super();

    this.projectRoot = process.cwd();
    this.log.debug(`Project root is ${this.projectRoot}`);

    this.jestConfig = options.strykerOptions.jest.config;
    this.jestConfig.rootDir = this.projectRoot;
  }

  public async run(): Promise<RunResult> {
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