import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { Mutant, StrykerOptions } from '@stryker-mutator/api/core';

import { tokens, Disposable } from 'typed-inject';
import { commonTokens } from '@stryker-mutator/api/plugin';

import { ChildProcessProxy } from '../child-proxy/child-process-proxy';
import { LoggingClientContext } from '../logging';
import { coreTokens } from '../di';

import { Worker } from '../concurrent/pool';

import { CheckerWorker } from './checker-worker';

createCheckerFactory.inject = tokens(commonTokens.options, coreTokens.loggingContext);
export function createCheckerFactory(options: StrykerOptions, loggingContext: LoggingClientContext): () => Checker {
  return () => new CheckerFacade(options, loggingContext);
}

export class CheckerFacade implements Checker, Disposable, Worker {
  private readonly childProcess?: ChildProcessProxy<CheckerWorker>;

  constructor(options: StrykerOptions, loggingContext: LoggingClientContext) {
    if (options.checkers.length) {
      this.childProcess = ChildProcessProxy.create(
        require.resolve('./checker-worker'),
        loggingContext,
        options,
        {},
        process.cwd(),
        CheckerWorker,
        []
      );
    }
  }

  public async dispose(): Promise<void> {
    if (this.childProcess) {
      await this.childProcess.dispose();
    }
  }

  public async init(): Promise<void> {
    if (this.childProcess) {
      return this.childProcess.proxy.init();
    }
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
