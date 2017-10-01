import { MatchedMutant, Reporter, MutantResult, MutantStatus } from 'stryker-api/report';

abstract class ProgressKeeper implements Reporter {

  protected progress = {
    survived: 0,
    tested: 0,
    total: 0
  };

  onAllMutantsMatchedWithTests(matchedMutants: ReadonlyArray<MatchedMutant>): void {
    this.progress.total = matchedMutants.filter(m => m.scopedTestIds.length > 0).length;
  }

  onMutantTested(result: MutantResult): void {
    this.progress.tested++;
    switch (result.status) {
      case MutantStatus.NoCoverage:
        this.progress.tested--; // correct for not tested, because no coverage
        break;
      case MutantStatus.Survived:
        this.progress.survived++;
        break;
    }
  }
}
export default ProgressKeeper;