import { Observable, Observer, merge, zip } from 'rxjs';
import { flatMap, map, tap, toArray } from 'rxjs/operators';
import { MutantResult, MutantStatus } from 'stryker-api/report';
import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import Sandbox from '../Sandbox';
import { SandboxPool } from '../SandboxPool';
import TestableMutant from '../TestableMutant';
import TranspiledMutant from '../TranspiledMutant';
import StrictReporter from '../reporters/StrictReporter';
import { MutantTranspileScheduler } from '../transpiler/MutantTranspileScheduler';
import { Logger } from 'stryker-api/logging';
import { tokens, commonTokens } from 'stryker-api/plugin';
import { coreTokens } from '../di';

export class MutationTestExecutor {
  public static inject = tokens(
    commonTokens.logger,
    coreTokens.reporter,
    coreTokens.mutantTranspileScheduler,
    coreTokens.sandboxPool);
  constructor(
    private readonly log: Logger,
    private readonly reporter: StrictReporter,
    private readonly mutantTranspileScheduler: MutantTranspileScheduler,
    private readonly sandboxPool: SandboxPool) {
  }

  public async run(allMutants: ReadonlyArray<TestableMutant>): Promise<MutantResult[]> {
    const results = await this.mutantTranspileScheduler.scheduleTranspileMutants(allMutants).pipe(
      // Test the mutant (either early result, or actually test it in a sandbox)
      flatMap(this.mutationTest),
      tap(this.reportResult),
      // Signal the mutant transpiler that there is another slot open for transpiling
      tap(this.mutantTranspileScheduler.scheduleNext),
      toArray(),
      tap(this.reportAll)
    ).toPromise();

    // TODO: Let typed inject dispose of sandbox pool
    await this.sandboxPool.disposeAll();
    await this.mutantTranspileScheduler.dispose();
    return results;
  }

  private readonly mutationTest = async (transpiledMutant: TranspiledMutant): Promise<MutantResult> => {

    const early = this.earlyResult(transpiledMutant);
    if (early) {
      return early;
    } else {
      const runResult = await this.sandboxPool.run(transpiledMutant);
      return this.collectMutantResult(transpiledMutant.mutant, runResult);
    }
  }

  private readonly earlyResult = (transpiledMutant: TranspiledMutant): MutantResult | null => {
    if (transpiledMutant.transpileResult.error) {
      if (this.log.isDebugEnabled()) {
        this.log.debug(`Transpile error occurred: "${transpiledMutant.transpileResult.error}" during transpiling of mutant ${transpiledMutant.mutant.toString()}`);
      }
      const result = transpiledMutant.mutant.result(MutantStatus.TranspileError, []);
      return result;
    } else if (!transpiledMutant.mutant.selectedTests.length) {
      const result = transpiledMutant.mutant.result(MutantStatus.NoCoverage, []);
      return result;
    } else if (!transpiledMutant.changedAnyTranspiledFiles) {
      const result = transpiledMutant.mutant.result(MutantStatus.Survived, []);
      return result;
    } else {
      // No early result possible, need to run in the sandbox later
      return null;
    }
  }

  private readonly collectMutantResult = (mutant: TestableMutant, runResult: RunResult) => {
    const status: MutantStatus = this.determineMutantState(runResult);
    const testNames = runResult.tests
      .filter(t => t.status !== TestStatus.Skipped)
      .map(t => t.name);
    if (this.log.isDebugEnabled() && status === MutantStatus.RuntimeError) {
      const error = runResult.errorMessages ? runResult.errorMessages.toString() : '(undefined)';
      this.log.debug('A runtime error occurred: %s during execution of mutant: %s', error, mutant.toString());
    }
    return mutant.result(status, testNames);
  }

  private readonly determineMutantState = (runResult: RunResult): MutantStatus => {
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

  private readonly reportResult = (mutantResult: MutantResult): void => {
    this.reporter.onMutantTested(mutantResult);
  }

  private readonly reportAll = (mutantResults: MutantResult[]): void => {
    this.reporter.onAllMutantsTested(mutantResults);
  }
}
