
/**
 * Represents a handlebars result context
 */
export default class HandlebarsModel {
  constructor(public title: string, public urlPrefix: string, public relativeUrl: string, public totalKilled: number, public totalSurvived: number, public totalUntested: number) {
    this.totalMutations = totalKilled + totalSurvived + totalUntested;
    this.totalCoveredMutations = totalKilled + totalSurvived;
    this.percentageBasedOnAllCode = Math.floor(totalKilled / this.totalMutations * 100) || 0,
      this.percentageBasedOnCoveredCode = Math.floor(totalKilled / this.totalCoveredMutations * 100) || 0
  };

  public totalMutations: number;
  public totalCoveredMutations: number;
  public percentageBasedOnAllCode: number;
  public percentageBasedOnCoveredCode: number;
}
