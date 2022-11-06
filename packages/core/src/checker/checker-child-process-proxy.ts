import { URL } from 'url';

import { FileDescriptions, Mutant, StrykerOptions } from '@stryker-mutator/api/core';
import { Disposable } from 'typed-inject';

import { ChildProcessProxy } from '../child-proxy/child-process-proxy.js';
import { LoggingClientContext } from '../logging/index.js';
import { Resource } from '../concurrent/pool.js';
import { IdGenerator } from '../child-proxy/id-generator.js';

import { CheckerWorker } from './checker-worker.js';
import { CheckerResource } from './checker-resource.js';

export class CheckerChildProcessProxy implements CheckerResource, Disposable, Resource {
  private readonly childProcess: ChildProcessProxy<CheckerWorker>;

  constructor(
    options: StrykerOptions,
    fileDescriptions: FileDescriptions,
    pluginModulePaths: readonly string[],
    loggingContext: LoggingClientContext,
    idGenerator: IdGenerator
  ) {
    this.childProcess = ChildProcessProxy.create(
      new URL('./checker-worker.js', import.meta.url).toString(),
      loggingContext,
      options,
      fileDescriptions,
      pluginModulePaths,
      process.cwd(),
      CheckerWorker,
      options.checkerNodeArgs,
      idGenerator
    );
  }

  public async dispose(): Promise<void> {
    await this.childProcess.dispose();
  }

  public async init(): Promise<void> {
    await this.childProcess.proxy.init();
  }

  public async check(checkerName: string, mutants: Mutant[]): ReturnType<CheckerResource['check']> {
    return this.childProcess.proxy.check(checkerName, mutants);
  }

  public async group(checkerName: string, mutants: Mutant[]): ReturnType<CheckerResource['group']> {
    return this.childProcess.proxy.group(checkerName, mutants);
  }
}
