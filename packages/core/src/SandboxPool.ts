import * as os from 'os';
import { range, Subject, Observable } from 'rxjs';
import { flatMap, tap, zip, merge, map } from 'rxjs/operators';
import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import Sandbox from './Sandbox';
import LoggingClientContext from './logging/LoggingClientContext';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { coreTokens } from './di';
import { InitialTestRunResult } from './process/InitialTestExecutor';
import { Logger } from '@stryker-mutator/api/logging';
import TranspiledMutant from './TranspiledMutant';
import { MutantResult } from '@stryker-mutator/api/report';

const MAX_CONCURRENT_INITIALIZING_SANDBOXES = 2;

export class SandboxPool {

  private readonly allSandboxes: Promise<Sandbox>[] = [];
  private readonly overheadTimeMS: number;

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

  public runMutants(mutants: Observable<TranspiledMutant>): Observable<MutantResult> {
    const recycledSandboxes = new Subject<Sandbox>();
    // Make sure sandboxes get recycled
    const sandboxes = this.startSandboxes().pipe(merge(recycledSandboxes));
    return mutants.pipe(
      zip(sandboxes),
      flatMap(this.runInSandbox),
      tap(({ sandbox }) => {
        recycledSandboxes.next(sandbox);
      }),
      map(({ result }) => result)
    );
  }

  private readonly runInSandbox = async ([mutant, sandbox]: [TranspiledMutant, Sandbox]) => {
    const result = await sandbox.runMutant(mutant);
    return { result, sandbox };
  }

  private startSandboxes(): Observable<Sandbox> {
    const concurrency = this.determineConcurrency();

    return range(0, concurrency).pipe(
      flatMap(n => {
        return this.registerSandbox(Sandbox.create(this.options, n, this.initialFiles, this.testFramework, this.overheadTimeMS, this.loggingContext));
      }, MAX_CONCURRENT_INITIALIZING_SANDBOXES)
    );
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
      this.allSandboxes.push(promisedSandbox);
      return promisedSandbox;
  }

  public async disposeAll() {
    const sandboxes = await Promise.all(this.allSandboxes);
    return Promise.all(sandboxes.map(sandbox => sandbox.dispose()));
  }
}
