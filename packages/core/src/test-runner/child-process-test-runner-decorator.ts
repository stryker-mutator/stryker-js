import { StrykerOptions } from '@stryker-mutator/api/core';
import { TestRunner, DryRunOptions, MutantRunOptions, MutantRunResult, DryRunResult } from '@stryker-mutator/api/test-runner';
import { ExpirableTask } from '@stryker-mutator/util';

import { ChildProcessCrashedError } from '../child-proxy/child-process-crashed-error';
import { ChildProcessProxy } from '../child-proxy/child-process-proxy';
import { LoggingClientContext } from '../logging';

import { ChildProcessTestRunnerWorker } from './child-process-test-runner-worker';

const MAX_WAIT_FOR_DISPOSE = 2000;

/**
 * Runs the given test runner in a child process and forwards reports about test results
 */
export class ChildProcessTestRunnerDecorator implements TestRunner {
  private readonly worker: ChildProcessProxy<ChildProcessTestRunnerWorker>;

  constructor(options: StrykerOptions, sandboxWorkingDirectory: string, loggingContext: LoggingClientContext) {
    this.worker = ChildProcessProxy.create(
      require.resolve('./child-process-test-runner-worker'),
      loggingContext,
      options,
      {},
      sandboxWorkingDirectory,
      ChildProcessTestRunnerWorker,
      options.testRunnerNodeArgs
    );
  }

  public init(): Promise<void> {
    return this.worker.proxy.init();
  }

  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.worker.proxy.dryRun(options);
  }
  public mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    return this.worker.proxy.mutantRun(options);
  }

  public async dispose(): Promise<void> {
    await ExpirableTask.timeout(
      // First let the inner test runner dispose
      this.worker.proxy.dispose().catch((error) => {
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
