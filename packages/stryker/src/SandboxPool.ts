import * as os from 'os';
import { range, Subject } from 'rxjs';
import { flatMap, tap, filter } from 'rxjs/operators';
import { File, StrykerOptions } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import Sandbox from './Sandbox';
import LoggingClientContext from './logging/LoggingClientContext';
import { tokens, commonTokens } from 'stryker-api/plugin';
import { coreTokens } from './di';
import { InitialTestRunResult } from './process/InitialTestExecutor';
import { Logger } from 'stryker-api/logging';
import TranspiledMutant from './TranspiledMutant';
import { Task } from './utils/Task';
import { RunResult, RunStatus } from 'stryker-api/test_runner';

const MAX_CONCURRENT_INITIALIZING_SANDBOXES = 2;

export class SandboxPool {

  private readonly allSandboxes: Promise<Sandbox>[] = [];
  private readonly overheadTimeMS: number;
  private readonly workerPool: Sandbox[] = [];
  private readonly backlog: { mutant: TranspiledMutant, task: Task<RunResult> }[] = [];
  private isDisposed = false;
  private sandboxesStarted = false;
  private persistentError: any = null;

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    coreTokens.testFramework,
    coreTokens.initialRunResult,
    coreTokens.transpiledFiles,
    coreTokens.loggingContext);
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly testFramework: TestFramework | null,
    initialRunResult: InitialTestRunResult,
    private readonly initialFiles: ReadonlyArray<File>,
    private readonly loggingContext: LoggingClientContext) {
    this.overheadTimeMS = initialRunResult.overheadTimeMS;
  }

  public run(mutant: TranspiledMutant): Promise<RunResult> {
    this.startSandboxes();
    const task = new Task<RunResult>();
    this.backlog.push({ mutant, task });
    this.doWork();
    return task.promise;
  }

  private readonly doWork = (): void => {
    const backlogItem = this.backlog.shift();
    if (backlogItem) {
      if (this.isDisposed) {
        backlogItem.task.resolve({ status: RunStatus.Timeout, tests: [] });
      } else if (this.persistentError) {
        backlogItem.task.reject(this.persistentError);
      } else {
        const sandbox = this.workerPool.pop();
        if (sandbox) {
          sandbox.runMutant(backlogItem.mutant)
            .then(backlogItem.task.resolve, backlogItem.task.reject)
            .then(() => this.releaseSandbox(sandbox));
        } else {
          // False alarm
          this.backlog.push(backlogItem);
        }
      }
    }
  }

  private startSandboxes(): void {
    if (!this.sandboxesStarted) {
      this.sandboxesStarted = true;
      const concurrency = this.determineConcurrency();

      range(0, concurrency).pipe(
        flatMap(n => this.registerSandbox(Sandbox.create(this.options, n, this.initialFiles, this.testFramework, this.overheadTimeMS, this.loggingContext)),
          MAX_CONCURRENT_INITIALIZING_SANDBOXES)
      ).subscribe({
        error: error => {
          this.persistentError = error;
          this.doWork();
        },
        next: this.releaseSandbox
      });
    }
  }

  private readonly releaseSandbox = (sandbox: Sandbox) => {
    this.workerPool.push(sandbox);
    // Let's see if there is work to be done in the next tick
    // (scheduling it next tick instead of immediately will prevent a stack overflow)
    process.nextTick(this.doWork);
  }

  private determineConcurrency() {
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
    return numConcurrentRunners;
  }

  private readonly registerSandbox = async (promisedSandbox: Promise<Sandbox>): Promise<Sandbox> => {
    if (this.isDisposed) {
      await promisedSandbox.then(sandbox => sandbox.dispose());
    } else {
      this.allSandboxes.push(promisedSandbox);
    }
    return promisedSandbox;
  }

  public async disposeAll() {
    this.isDisposed = true;
    const sandboxes = await Promise.all(this.allSandboxes);
    return Promise.all(sandboxes.map(sandbox => sandbox.dispose()));
  }
}
