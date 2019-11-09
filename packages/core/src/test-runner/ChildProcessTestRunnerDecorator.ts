import { StrykerOptions } from '@stryker-mutator/api/core';
import { RunOptions, RunResult, TestRunner } from '@stryker-mutator/api/test_runner';
import ChildProcessCrashedError from '../child-proxy/ChildProcessCrashedError';
import ChildProcessProxy from '../child-proxy/ChildProcessProxy';
import LoggingClientContext from '../logging/LoggingClientContext';
import { timeout } from '../utils/objectUtils';
import { ChildProcessTestRunnerWorker } from './ChildProcessTestRunnerWorker';

const MAX_WAIT_FOR_DISPOSE = 2000;

/**
 * Runs the given test runner in a child process and forwards reports about test results
 */
export default class ChildProcessTestRunnerDecorator implements TestRunner {
  private readonly worker: ChildProcessProxy<ChildProcessTestRunnerWorker>;

  constructor(options: StrykerOptions, sandboxFileNames: readonly string[], sandboxWorkingDirectory: string, loggingContext: LoggingClientContext) {
    this.worker = ChildProcessProxy.create(
      require.resolve(`./${ChildProcessTestRunnerWorker.name}`),
      loggingContext,
      options,
      { sandboxFileNames },
      sandboxWorkingDirectory,
      ChildProcessTestRunnerWorker
    );
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
