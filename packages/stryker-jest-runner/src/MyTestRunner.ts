import { TestRunner, RunnerOptions, RunOptions, RunResult, TestResult, RunState, TestState } from 'stryker-api/test_runner';
import { EventEmitter } from 'events';

/**
 * Represents a TestRunner which can execute tests, resulting in a RunResult.
 *
 * A test runner should:
 *  - Report per a `testResult` per test. See `TestResult` interfact to know what is expected.
 *  - Emit `'test_done'` event with a TestResult as argument every time a test is executed (for reporting purposes)
 *  - Report on code coverage after the initial test run (maybe, see below)
 *
 * ## A note on code coverage:
 *
 * TL;DR
 * If the test runner ran the tests in the same process as the test runner is spawned in, it doesn't have to do anything.
 * If it runs in a different process (i.e. a worker process) or uses a browser (i.e. karma) it needs to do something, see below.
 *
 * Collecting code coverage can improve the performance of a mutation test run quite a bit. Instead of running all tests for all mutants,
 * it can select which tests to run per mutant. Code coverage is a shared responsibility between Stryker and the test runner depending on the
 * `coverageStrategy`:
 *
 * 1. If `coverageAnalysis: 'off'`: No code coverage should be collected.
 * 2. If `coverageStrategy: 'all'`: Coverage should be collected for the entire test run.
 * 3. If `coverageStrategy: 'perTest'`: Coverage should be collected per test.
 *
 * For 2 and 3, Stryker will instrument the code with the istanbul code coverage engine during initial run.
 * In case of 3, Stryker will also inject beforeEach and afterEach hooks (specific to each test framework) in distinct between specific tests.
 *
 * At the end of the test run, the code coverage report is ready in a global variable called `__coverage__`. Node based test runners
 * which run there tests in the same process as the test runner is spawned in actually don't have to do any work, Stryker will be able
 * to pick up the report globally. However, if running in worker processes or a browser, it is the test runner's responsibility to
 * report the `__coverage__` at the end of the test run.
 *
 * If it doesn't exists globally, you don't have to do anything. In that case its not an initial test run and there was no code instrumented.
 */
export default class MyTestRunner extends EventEmitter implements TestRunner {

  constructor(options: RunnerOptions) {
    super();
  }

  /**
    * Optional. When implemented, will be called before runs are done on this test runner.
    * @returns A promise if stuff is initialized asyncronously, runs will not start until the promise is resolved.
    * Otherwise void
    */
  init(): Promise<any> | void {

  }

  /**
   * Executes a test run.
   * @param options The options for this test run.
   * @returns A promise to eventually complete the test run and deliver a RunResult.
   */
  run(options: RunOptions): Promise<RunResult> {
    const oneTestResult: TestResult = {
      /**
      * The full human readable name of the test
      */
      name: '',
      /**
       * The state of the test
       */
      state: TestState.Success,
      /**
       * Optional: any error messages
       */
      // errorMessages: string[];

      /**
       * Optional: the time it took
       */
      timeSpentMs: 15
    };

    return Promise.resolve({
      /**
          * The individual test results.
          */
      tests: [oneTestResult],
      /**
       * If `state` is `error`, this collection should contain the error messages
       */
      errorMessages: ['Error, test runner not implemented'],
      /**
       * The state of the run
       */
      state: RunState.Complete,
      /**
     * Optional: the code coverage result of the run.
     */
      // coverage?: CoverageCollection | CoverageCollectionPerTest;

    });
  }

  /**
   * Optional. When implemented, will be called before the test runner's process is killed.
   * @returns A promise if stuff is destroyed asyncronously, the runners process will not end until the promise is resolved.
   * Otherwise void
   */
  dispose?(): Promise<any> | void {

  }
}