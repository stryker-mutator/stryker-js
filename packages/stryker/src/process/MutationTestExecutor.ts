import { Observable, Observer, merge, zip } from 'rxjs';
import { flatMap, map, tap, toArray } from 'rxjs/operators';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { MutantResult, MutantStatus } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';
import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import Sandbox from '../Sandbox';
import SandboxPool from '../SandboxPool';
import TestableMutant from '../TestableMutant';
import TranspiledMutant from '../TranspiledMutant';
import StrictReporter from '../reporters/StrictReporter';
import MutantTranspiler from '../transpiler/MutantTranspiler';
import LoggingClientContext from '../logging/LoggingClientContext';
import { getLogger, Logger } from 'stryker-api/logging';

export default class MutationTestExecutor {

  constructor(
    private config: Config,
    private inputFiles: ReadonlyArray<File>,
    private testFramework: TestFramework | null,
    private reporter: StrictReporter,
    private overheadTimeMS: number,
    private loggingContext: LoggingClientContext) {
  }

  async run(allMutants: TestableMutant[]): Promise<MutantResult[]> {
    const mutantTranspiler = new MutantTranspiler(this.config, this.loggingContext);
    const transpiledFiles = await mutantTranspiler.initialize(this.inputFiles);
    const sandboxPool = new SandboxPool(this.config, this.testFramework, transpiledFiles, this.overheadTimeMS, this.loggingContext);
    const result = await this.runInsideSandboxes(
      sandboxPool.streamSandboxes(),
      mutantTranspiler.transpileMutants(allMutants));
    await sandboxPool.disposeAll();
    mutantTranspiler.dispose();
    return result;
  }

  private runInsideSandboxes(sandboxes: Observable<Sandbox>, transpiledMutants: Observable<TranspiledMutant>): Promise<MutantResult[]> {
    let recycleObserver: Observer<Sandbox>;
    const recycled = new Observable<Sandbox>(observer => {
      recycleObserver = observer;
    });
    function recycle(sandbox: { sandbox: Sandbox, result: MutantResult }) {
      return recycleObserver.next(sandbox.sandbox);
    }

    function completeRecycle() {
      if (recycleObserver) {
        recycleObserver.complete();
      }
    }

    return zip(transpiledMutants, merge(recycled, sandboxes), createTuple)
      .pipe(
        map(earlyResult),
        flatMap(runInSandbox),
        tap(recycle),
        map(({ result }) => result),
        tap(reportResult(this.reporter)),
        toArray(),
        tap(completeRecycle),
        tap(reportAll(this.reporter)))
      .toPromise(Promise);
  }
}

function earlyResult([transpiledMutant, sandbox]: [TranspiledMutant, Sandbox]): [TranspiledMutant, Sandbox, MutantResult | null] {
  if (transpiledMutant.transpileResult.error) {
    const result = transpiledMutant.mutant.result(MutantStatus.TranspileError, []);
    return [transpiledMutant, sandbox, result];
  } else if (!transpiledMutant.mutant.selectedTests.length) {
    const result = transpiledMutant.mutant.result(MutantStatus.NoCoverage, []);
    return [transpiledMutant, sandbox, result];
  } else if (!transpiledMutant.changedAnyTranspiledFiles) {
    const result = transpiledMutant.mutant.result(MutantStatus.Survived, []);
    return [transpiledMutant, sandbox, result];
  } else {
    // No early result possible, need to run in the sandbox later
    return [transpiledMutant, sandbox, null];
  }
}

function runInSandbox([transpiledMutant, sandbox, earlyResult]: [TranspiledMutant, Sandbox, MutantResult | null]): Promise<{ sandbox: Sandbox, result: MutantResult }> {
  const log = getLogger(MutationTestExecutor.name);
  if (earlyResult) {
    return Promise.resolve({ sandbox, result: earlyResult });
  } else {
    return sandbox.runMutant(transpiledMutant)
      .then(runResult => ({ sandbox, result: collectMutantResult(transpiledMutant.mutant, runResult, log) }));
  }
}

function createTuple<T1, T2>(a: T1, b: T2): [T1, T2] {
  return [a, b];
}

function collectMutantResult(mutant: TestableMutant, runResult: RunResult, log: Logger) {
  const status: MutantStatus = mutantState(runResult);
  const testNames = runResult.tests
    .filter(t => t.status !== TestStatus.Skipped)
    .map(t => t.name);
  if (log.isDebugEnabled() && status === MutantStatus.RuntimeError) {
    const error = runResult.errorMessages ? runResult.errorMessages.toString() : '(undefined)';
    log.debug('A runtime error occurred: %s during execution of mutant: %s', error, mutant.toString());
  }
  return mutant.result(status, testNames);
}

function mutantState(runResult: RunResult): MutantStatus {
  switch (runResult.status) {
    case RunStatus.Timeout:
      return MutantStatus.TimedOut;
    case RunStatus.Error:
      return MutantStatus.RuntimeError;
    case RunStatus.Complete:
      if (runResult.tests.some(t => t.status === TestStatus.Failed)) {
        return MutantStatus.Killed;
      } else {
        return MutantStatus.Survived;
      }
  }
}

function reportResult(reporter: StrictReporter) {
  return (mutantResult: MutantResult) => {
    reporter.onMutantTested(mutantResult);
  };
}

function reportAll(reporter: StrictReporter) {
  return (mutantResults: MutantResult[]) => {
    reporter.onAllMutantsTested(mutantResults);
  };
}