import { tap, toArray } from 'rxjs/operators';
import { MutantResult } from '@stryker-mutator/api/report';
import { SandboxPool } from '../SandboxPool';
import TestableMutant from '../TestableMutant';
import StrictReporter from '../reporters/StrictReporter';
import { MutantTranspileScheduler } from '../transpiler/MutantTranspileScheduler';
import { tokens } from '@stryker-mutator/api/plugin';
import { coreTokens } from '../di';

export class MutationTestExecutor {
  public static inject = tokens(
    coreTokens.Reporter,
    coreTokens.MutantTranspileScheduler,
    coreTokens.SandboxPool);
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

    return results;
  }

  private readonly reportResult = (mutantResult: MutantResult): void => {
    this.reporter.onMutantTested(mutantResult);
  }

  private readonly reportAll = (mutantResults: MutantResult[]): void => {
    this.reporter.onAllMutantsTested(mutantResults);
  }
}
