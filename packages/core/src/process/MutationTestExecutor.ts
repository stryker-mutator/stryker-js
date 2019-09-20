import { tokens } from '@stryker-mutator/api/plugin';
import { MutantResult } from '@stryker-mutator/api/report';
import { tap, toArray } from 'rxjs/operators';
import { coreTokens } from '../di';
import StrictReporter from '../reporters/StrictReporter';
import { SandboxPool } from '../SandboxPool';
import TestableMutant from '../TestableMutant';
import { MutantTranspileScheduler } from '../transpiler/MutantTranspileScheduler';

export class MutationTestExecutor {
  public static inject = tokens(coreTokens.reporter, coreTokens.mutantTranspileScheduler, coreTokens.sandboxPool);
  constructor(
    private readonly reporter: StrictReporter,
    private readonly mutantTranspileScheduler: MutantTranspileScheduler,
    private readonly sandboxPool: SandboxPool
  ) {}

  public async run(allMutants: readonly TestableMutant[]): Promise<MutantResult[]> {
    const results = await this.sandboxPool
      .runMutants(this.mutantTranspileScheduler.scheduleTranspileMutants(allMutants))
      .pipe(
        tap(this.reportResult),
        // Signal the mutant transpiler that there is another slot open for transpiling
        tap(this.mutantTranspileScheduler.scheduleNext),
        toArray(),
        tap(this.reportAll)
      )
      .toPromise();

    return results;
  }

  private readonly reportResult = (mutantResult: MutantResult): void => {
    this.reporter.onMutantTested(mutantResult);
  };

  private readonly reportAll = (mutantResults: MutantResult[]): void => {
    this.reporter.onAllMutantsTested(mutantResults);
  };
}
