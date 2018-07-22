import { TestRunner, RunResult, RunOptions, RunnerOptions } from 'stryker-api/test_runner';
import LoggingClientContext from '../logging/LoggingClientContext';
import ChildProcessProxy from '../child-proxy/ChildProcessProxy';
import ChildProcessTestRunnerWorker from './ChildProcessTestRunnerWorker';
import { sleep } from '../utils/objectUtils';

const MAX_WAIT_FOR_DISPOSE = 2000;

/**
 * Runs the given test runner in a child process and forwards reports about test results
 * Also implements timeout-mechanism (on timeout, restart the child runner and report timeout) 
 */
export default class ChildProcessTestRunnerDecorator implements TestRunner {

  private readonly worker: ChildProcessProxy<ChildProcessTestRunnerWorker>;

  constructor(realTestRunnerName: string,
    options: RunnerOptions,
    sandboxWorkingDirectory: string,
    loggingContext: LoggingClientContext) {
    this.worker = ChildProcessProxy.create(
      require.resolve('./ChildProcessTestRunnerWorker.js'),
      loggingContext,
      options.strykerOptions.plugins || [],
      sandboxWorkingDirectory,
      ChildProcessTestRunnerWorker, realTestRunnerName, options);
  }

  init(): Promise<void> {
    return this.worker.proxy.init();
  }

  run(options: RunOptions): Promise<RunResult> {
    return this.worker.proxy.run(options);
  }

  async dispose(): Promise<void> {
    
    await Promise.race([
      // First let the inner test runner dispose
      this.worker.proxy.dispose(),

      // ... but don't wait forever on that
      sleep(MAX_WAIT_FOR_DISPOSE)
    ]);

    // After that, dispose the child process itself
    await this.worker.dispose();
  }
}