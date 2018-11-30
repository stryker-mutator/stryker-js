import { TestRunner, RunResult, RunOptions, RunnerOptions } from 'stryker-api/test_runner';
import LoggingClientContext from '../logging/LoggingClientContext';
import ChildProcessProxy from '../child-proxy/ChildProcessProxy';
import ChildProcessTestRunnerWorker from './ChildProcessTestRunnerWorker';
import { timeout } from '../utils/objectUtils';
import ChildProcessCrashedError from '../child-proxy/ChildProcessCrashedError';

const MAX_WAIT_FOR_DISPOSE = 2000;

/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Also implements timeout-mechanism (on timeout, restart the child runner and report timeout)
 */
export default class ChildProcessTestRunnerDecorator implements TestRunner {

  private readonly worker: ChildProcessProxy<ChildProcessTestRunnerWorker>;

  constructor(
    realTestRunnerName: string,
    options: RunnerOptions,
    plugins: string[],
    sandboxWorkingDirectory: string,
    loggingContext: LoggingClientContext) {
    this.worker = ChildProcessProxy.create(
      require.resolve('./ChildProcessTestRunnerWorker.js'),
      loggingContext,
      plugins || [],
      sandboxWorkingDirectory,
      ChildProcessTestRunnerWorker, realTestRunnerName, options);
  }

  public init(): Promise<void> {
    return this.worker.proxy.init();
  }

  public run(options: RunOptions): Promise<RunResult> {
    return this.worker.proxy.run(options);
  }

  public async dispose(): Promise<void> {

    await timeout(
      // First let the inner test runner dispose
      this.worker.proxy.dispose().catch(error => {
        // It's OK if the child process is already down.
        if (!(error instanceof ChildProcessCrashedError)) {
          throw error;
        }
      }),

      // ... but don't wait forever on that
      MAX_WAIT_FOR_DISPOSE
    );

    // After that, dispose the child process itself
    await this.worker.dispose();
  }
}
