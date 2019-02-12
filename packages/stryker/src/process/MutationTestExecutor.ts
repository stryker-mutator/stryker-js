import { tap, toArray } from 'rxjs/operators';
import { MutantResult } from 'stryker-api/report';
import { SandboxPool } from '../SandboxPool';
import TestableMutant from '../TestableMutant';
import StrictReporter from '../reporters/StrictReporter';
import { MutantTranspileScheduler } from '../transpiler/MutantTranspileScheduler';
import { tokens } from 'stryker-api/plugin';
import { coreTokens } from '../di';

export class MutationTestExecutor {
  public static inject = tokens(
    coreTokens.reporter,
    coreTokens.mutantTranspileScheduler,
    coreTokens.sandboxPool);
  constructor(
    private readonly reporter: StrictReporter,
    private readonly mutantTranspileScheduler: MutantTranspileScheduler,
    private readonly sandboxPool: SandboxPool) {
  }

  public async run(allMutants: ReadonlyArray<TestableMutant>): Promise<MutantResult[]> {

    const results = await this.sandboxPool.runMutants(this.mutantTranspileScheduler.scheduleTranspileMutants(allMutants)).pipe(
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

  private readonly reportResult = (mutantResult: MutantResult): void => {
    this.reporter.onMutantTested(mutantResult);
  }

  private readonly reportAll = (mutantResults: MutantResult[]): void => {
    this.reporter.onAllMutantsTested(mutantResults);
  }
}
