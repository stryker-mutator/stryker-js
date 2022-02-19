import { URL } from 'url';

import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Disposable } from 'typed-inject';

import { ChildProcessProxy } from '../child-proxy/child-process-proxy.js';
import { LoggingClientContext } from '../logging/index.js';
import { Resource } from '../concurrent/pool.js';

import { CheckerWorker } from './checker-worker.js';
import { CheckerResource } from './checker-resource.js';

export class CheckerChildProcessProxy implements CheckerResource, Disposable, Resource {
  private readonly childProcess: ChildProcessProxy<CheckerWorker>;

  constructor(options: StrykerOptions, pluginModulePaths: readonly string[], loggingContext: LoggingClientContext) {
    this.childProcess = ChildProcessProxy.create(
      new URL('./checker-worker.js', import.meta.url).toString(),
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

  public async check(checkerIndex: number, mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    if (this.childProcess) {
      return this.childProcess.proxy.check(checkerIndex, mutants);
    }

    const result: Record<string, CheckResult> = {};
    mutants.forEach((mutant) => (result[mutant.id] = { status: CheckStatus.Passed }));

    return result;
  }

  public async createGroups(checkerIndex: number, mutants: Mutant[]): Promise<Mutant[][] | undefined> {
    return this.childProcess.proxy.createGroups(checkerIndex, mutants);
  }
}
