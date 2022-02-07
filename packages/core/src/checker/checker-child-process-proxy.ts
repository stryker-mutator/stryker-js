import { fileURLToPath, URL } from 'url';

import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Disposable } from 'typed-inject';

import { ChildProcessProxy } from '../child-proxy/child-process-proxy.js';
import { LoggingClientContext } from '../logging/index.js';
import { Resource } from '../concurrent/pool.js';

import { CheckerWorker } from './checker-worker.js';

export class CheckerChildProcessProxy implements Checker, Disposable, Resource {
  private readonly childProcess: ChildProcessProxy<CheckerWorker>;

  constructor(options: StrykerOptions, pluginModulePaths: readonly string[], loggingContext: LoggingClientContext) {
    this.childProcess = ChildProcessProxy.create(
      fileURLToPath(new URL('./checker-worker.js', import.meta.url)),
      loggingContext,
      options,
      pluginModulePaths,
      process.cwd(),
      CheckerWorker,
      options.checkerNodeArgs
    );
  }

  public async dispose(): Promise<void> {
    await this.childProcess?.dispose();
  }

  public async init(): Promise<void> {
    await this.childProcess?.proxy.init();
  }

  public async check(mutant: Mutant): Promise<CheckResult> {
    if (this.childProcess) {
      return this.childProcess.proxy.check(mutant);
    }
    return {
      status: CheckStatus.Passed,
    };
  }
}
