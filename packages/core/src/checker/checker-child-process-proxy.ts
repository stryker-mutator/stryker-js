import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Disposable } from 'typed-inject';

import { ChildProcessProxy } from '../child-proxy/child-process-proxy';
import { LoggingClientContext } from '../logging';
import { Resource } from '../concurrent/pool';

import { CheckerWorker } from './checker-worker';

export class CheckerChildProcessProxy implements Checker, Disposable, Resource {
  private readonly childProcess: ChildProcessProxy<CheckerWorker>;

  constructor(options: StrykerOptions, loggingContext: LoggingClientContext) {
    this.childProcess = ChildProcessProxy.create(
      require.resolve('./checker-worker'),
      loggingContext,
      options,
      {},
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

  public async checkGroup(mutants: Mutant[]): Promise<Array<{ mutant: Mutant; checkResult: CheckResult }>> {
    return this.childProcess.proxy.checkGroup(mutants);
  }

  public async createGroups(mutants: Mutant[]): Promise<Mutant[][] | undefined> {
    return this.childProcess.proxy.createGroups(mutants);
  }
}
