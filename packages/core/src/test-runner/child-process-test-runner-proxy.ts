import { URL } from 'url';

import { FileDescriptions, StrykerOptions } from '@stryker-mutator/api/core';
import { LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import {
  TestRunner,
  DryRunOptions,
  MutantRunOptions,
  MutantRunResult,
  DryRunResult,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import { ExpirableTask } from '@stryker-mutator/util';

import { ChildProcessCrashedError } from '../child-proxy/child-process-crashed-error.js';
import { ChildProcessProxy } from '../child-proxy/child-process-proxy.js';
import { LoggingServerAddress } from '../logging/index.js';

import { IdGenerator } from '../child-proxy/id-generator.js';

import { ChildProcessTestRunnerWorker } from './child-process-test-runner-worker.js';

const MAX_WAIT_FOR_DISPOSE = 2000;

/**
 * Runs the given test runner in a child process and forwards reports about test results
 */
export class ChildProcessTestRunnerProxy implements TestRunner {
  private readonly worker: ChildProcessProxy<ChildProcessTestRunnerWorker>;
  private readonly log;
  constructor(
    options: StrykerOptions,
    fileDescriptions: FileDescriptions,
    sandboxWorkingDirectory: string,
    loggingServerAddress: LoggingServerAddress,
    pluginModulePaths: readonly string[],
    getLogger: LoggerFactoryMethod,
    idGenerator: IdGenerator,
  ) {
    this.log = getLogger(ChildProcessTestRunnerProxy.name);
    this.worker = ChildProcessProxy.create(
      new URL(
        './child-process-test-runner-worker.js',
        import.meta.url,
      ).toString(),
      loggingServerAddress,
      options,
      fileDescriptions,
      pluginModulePaths,
      sandboxWorkingDirectory,
      ChildProcessTestRunnerWorker,
      options.testRunnerNodeArgs,
      getLogger,
      idGenerator,
    );
  }

  public capabilities(): Promise<TestRunnerCapabilities> {
    return this.worker.proxy.capabilities();
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
      this.worker.proxy.dispose().catch((error: unknown) => {
        // It's OK if the child process is already down.
        if (!(error instanceof ChildProcessCrashedError)) {
          // Handle error by logging it. We still want to kill the child process.
          this.log.warn(
            'An unexpected error occurred during test runner disposal. This might be worth looking into. Stryker will ignore this error.',
            error,
          );
        }
      }),

      // ... but don't wait forever on that
      MAX_WAIT_FOR_DISPOSE,
    );

    // After that, dispose the child process itself
    await this.worker.dispose();
  }
}
