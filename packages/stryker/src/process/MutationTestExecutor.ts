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
import { getLogger } from 'stryker-api/logging';

export default class MutationTestExecutor {
  private readonly log = getLogger(MutationTestExecutor.name);

  constructor(
    private readonly config: Config,
    private readonly inputFiles: ReadonlyArray<File>,
    private readonly testFramework: TestFramework | null,
    private readonly reporter: StrictReporter,
    private readonly overheadTimeMS: number,
    private readonly loggingContext: LoggingClientContext) {
  }

  public async run(allMutants: TestableMutant[]): Promise<MutantResult[]> {
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
        map(this.earlyResult),
        flatMap(this.runInSandbox),
        tap(recycle),
        map(({ result }) => result),
        tap(reportResult(this.reporter)),
        toArray(),
        tap(completeRecycle),
        tap(reportAll(this.reporter)))
      .toPromise(Promise);
  }

  private readonly earlyResult = ([transpiledMutant, sandbox]: [TranspiledMutant, Sandbox]): [TranspiledMutant, Sandbox, MutantResult | null] => {
    if (transpiledMutant.transpileResult.error) {
      if (this.log.isDebugEnabled()) {
        this.log.debug(`Transpile error occurred: "${transpiledMutant.transpileResult.error}" during transpiling of mutant ${transpiledMutant.mutant.toString()}`);
      }
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

  private readonly runInSandbox = ([transpiledMutant, sandbox, earlyResult]: [TranspiledMutant, Sandbox, MutantResult | null]):
    Promise<{ sandbox: Sandbox, result: MutantResult }> => {
    if (earlyResult) {
      return Promise.resolve({ sandbox, result: earlyResult });
    } else {
      return sandbox.runMutant(transpiledMutant)
        .then(runResult => ({ sandbox, result: this.collectMutantResult(transpiledMutant.mutant, runResult) }));
    }
  }

  private readonly collectMutantResult = (mutant: TestableMutant, runResult: RunResult) => {
    const status: MutantStatus = mutantState(runResult);
    const testNames = runResult.tests
      .filter(t => t.status !== TestStatus.Skipped)
      .map(t => t.name);
    if (this.log.isDebugEnabled() && status === MutantStatus.RuntimeError) {
      const error = runResult.errorMessages ? runResult.errorMessages.toString() : '(undefined)';
      this.log.debug('A runtime error occurred: %s during execution of mutant: %s', error, mutant.toString());
    }
    return mutant.result(status, testNames);
  }
}

function createTuple<T1, T2>(a: T1, b: T2): [T1, T2] {
  return [a, b];
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
