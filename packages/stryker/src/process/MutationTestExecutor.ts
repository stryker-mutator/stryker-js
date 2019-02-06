import { Observable, Observer, merge, zip } from 'rxjs';
import { flatMap, map, tap, toArray } from 'rxjs/operators';
import { MutantResult, MutantStatus } from 'stryker-api/report';
import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import Sandbox from '../Sandbox';
import { SandboxPool } from '../SandboxPool';
import TestableMutant from '../TestableMutant';
import TranspiledMutant from '../TranspiledMutant';
import StrictReporter from '../reporters/StrictReporter';
import MutantTranspiler from '../transpiler/MutantTranspiler';
import { Logger } from 'stryker-api/logging';
import { tokens, commonTokens } from 'stryker-api/plugin';
import { coreTokens } from '../di';
import InputFileCollection from '../input/InputFileCollection';

export class MutationTestExecutor {
  public static inject = tokens(
    commonTokens.logger,
    coreTokens.inputFiles,
    coreTokens.reporter,
    coreTokens.mutantTranspiler,
    coreTokens.sandboxPool);
  constructor(
    private readonly log: Logger,
    private readonly input: InputFileCollection,
    private readonly reporter: StrictReporter,
    private readonly mutantTranspiler: MutantTranspiler,
    private readonly sandboxPool: SandboxPool) {
  }

  public async run(allMutants: ReadonlyArray<TestableMutant>): Promise<MutantResult[]> {
    const transpiledFiles = await this.mutantTranspiler.initialize(this.input.files);
    const result = await this.runInsideSandboxes(
      this.sandboxPool.streamSandboxes(transpiledFiles),
      this.mutantTranspiler.transpileMutants(allMutants));
    await this.sandboxPool.disposeAll();
    this.mutantTranspiler.dispose();
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
