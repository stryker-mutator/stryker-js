import * as os from 'os';
import { Observable, range } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { File, StrykerOptions } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import Sandbox from './Sandbox';
import LoggingClientContext from './logging/LoggingClientContext';
import { tokens, commonTokens } from 'stryker-api/plugin';
import { coreTokens } from './di';
import { InitialTestRunResult } from './process/InitialTestExecutor';
import { Logger } from 'stryker-api/logging';

export class SandboxPool {

  private readonly sandboxes: Promise<Sandbox>[] = [];
  private readonly overheadTimeMS: number;

  public static inject = tokens(commonTokens.logger, commonTokens.options, coreTokens.testFramework, coreTokens.initialRunResult, coreTokens.loggingContext);
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly testFramework: TestFramework | null,
    initialRunResult: InitialTestRunResult,
    private readonly loggingContext: LoggingClientContext) {
      this.overheadTimeMS = initialRunResult.overheadTimeMS;
    }

  public streamSandboxes(initialFiles: ReadonlyArray<File>): Observable<Sandbox> {
    let numConcurrentRunners = os.cpus().length;
    if (this.options.transpilers.length) {
      // If transpilers are configured, one core is reserved for the compiler (for now)
      numConcurrentRunners--;
    }
    let numConcurrentRunnersSource = 'CPU count';
    if (numConcurrentRunners > this.options.maxConcurrentTestRunners && this.options.maxConcurrentTestRunners > 0) {
      numConcurrentRunners = this.options.maxConcurrentTestRunners;
      numConcurrentRunnersSource = 'maxConcurrentTestRunners config';
    }
    if (numConcurrentRunners <= 0) {
      numConcurrentRunners = 1;
    }
    this.log.info(`Creating ${numConcurrentRunners} test runners (based on ${numConcurrentRunnersSource})`);

    const sandboxes = range(0, numConcurrentRunners)
      .pipe(flatMap(n => this.registerSandbox(Sandbox.create(this.options, n, initialFiles, this.testFramework, this.overheadTimeMS, this.loggingContext))));
    return sandboxes;
  }

  private registerSandbox(promisedSandbox: Promise<Sandbox>): Promise<Sandbox> {
    this.sandboxes.push(promisedSandbox);
    return promisedSandbox;
  }

  public disposeAll() {
    return Promise.all(this.sandboxes.map(promisedSandbox => promisedSandbox.then(sandbox => sandbox.dispose())));
  }
}
