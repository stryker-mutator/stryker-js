import { MatchedMutant, Reporter, MutantResult } from 'stryker-api/report';
import { MutantStatus } from 'stryker-api/report';

abstract class ProgressKeeper implements Reporter {

  protected progress = {
    survived: 0,
    tested: 0,
    total: 0
  };

  private mutantIdsWithoutCoverage: string[];

  public onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    this.mutantIdsWithoutCoverage = matchedMutants.filter(m => m.scopedTestIds.length === 0).map(m => m.id);
    this.progress.total = matchedMutants.length - this.mutantIdsWithoutCoverage.length;
  }

  public onMutantTested(result: MutantResult): void {
    if (!this.mutantIdsWithoutCoverage.some(id => result.id === id)) {
      this.progress.tested++;
    }
    if (result.status === MutantStatus.Survived) {
      this.progress.survived++;
    }
  }
}
export default ProgressKeeper;
