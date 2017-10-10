import Sandbox from '../Sandbox';
import { Observable, Observer } from 'rxjs';
import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import { MutantResult, MutantStatus } from 'stryker-api/report';
import { Config } from 'stryker-api/config';
import { TestFramework } from 'stryker-api/test_framework';
import { File } from 'stryker-api/core';
import TranspiledMutant from '../TranspiledMutant';
import StrictReporter from '../reporters/StrictReporter';
import TestableMutant from '../TestableMutant';
import MutantTranspiler from '../transpiler/MutantTranspiler';
import SandboxPool from '../SandboxPool';

export default class MutationTestExecutor {


  constructor(private config: Config, private inputFiles: File[], private testFramework: TestFramework | null, private reporter: StrictReporter) {
  }

  async run(allMutants: TestableMutant[]): Promise<MutantResult[]> {
    const mutantTranspiler = new MutantTranspiler(this.config);
    const transpileResult = await mutantTranspiler.initialize(this.inputFiles);
    const sandboxPool = new SandboxPool(this.config, this.testFramework, transpileResult.outputFiles);
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

    return transpiledMutants
      .zip(recycled.merge(sandboxes), createTuple)
      .flatMap(runInSandbox)
      .do(recycle)
      .map(({ result }) => result)
      .do(reportResult(this.reporter))
      .toArray()
      .do(completeRecycle)
      .do(reportAll(this.reporter))
      .toPromise(Promise);
  }
}

function runInSandbox([transpiledMutant, sandbox]: [TranspiledMutant, Sandbox]): Promise<{ sandbox: Sandbox, result: MutantResult }> {
  if (transpiledMutant.transpileResult.error) {
    const result = transpiledMutant.mutant.result(MutantStatus.TranspileError, []);
    return Promise.resolve({ sandbox, result });
  } else if (!transpiledMutant.mutant.scopedTestIds.length) {
    const result = transpiledMutant.mutant.result(MutantStatus.NoCoverage, []);
    return Promise.resolve({ sandbox, result });
  } else {
    return sandbox.runMutant(transpiledMutant)
      .then(runResult => ({ sandbox, result: collectMutantResult(transpiledMutant.mutant, runResult) }));
  }
}

function createTuple<T1, T2>(a: T1, b: T2): [T1, T2] {
  return [a, b];
}

function collectMutantResult(mutant: TestableMutant, runResult: RunResult) {
  let status: MutantStatus = MutantStatus.NoCoverage;
  let testNames: string[];
  if (runResult) {
    switch (runResult.status) {
      case RunStatus.Timeout:
        status = MutantStatus.TimedOut;
        break;
      case RunStatus.Error:
        status = MutantStatus.RuntimeError;
        break;
      case RunStatus.Complete:
        if (runResult.tests.some(t => t.status === TestStatus.Failed)) {
          status = MutantStatus.Killed;
        } else {
          status = MutantStatus.Survived;
        }
        break;
    }
    testNames = runResult.tests
      .filter(t => t.status !== TestStatus.Skipped)
      .map(t => t.name);
  } else {
    testNames = [];
  }
  return mutant.result(status, testNames);
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