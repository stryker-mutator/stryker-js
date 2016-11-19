
/**
 * Represents a handlebars result context
 */
export default class HandlebarsModel {
  constructor(public title: string, public urlPrefix: string, public relativeUrl: string, public totalKilled: number, public totalTimedOut: number, public totalSurvived: number, public totalNoCoverage: number, public totalErrors: number) {
    this.totalUndetected = totalSurvived + totalNoCoverage;
    this.totalDetected = totalKilled + totalTimedOut;
    this.totalMutations = this.totalDetected + this.totalUndetected;
    this.totalCoveredMutations = this.totalDetected + totalSurvived;
    this.percentageBasedOnAllCode = Math.floor(this.totalDetected / this.totalMutations * 100) || 0;
    this.percentageBasedOnCoveredCode = Math.floor(this.totalDetected / this.totalCoveredMutations * 100) || 0;
  };

  public totalDetected: number;
  public totalUndetected: number;
  public totalMutations: number;
  public totalCoveredMutations: number;
  public percentageBasedOnAllCode: number;
  public percentageBasedOnCoveredCode: number;
}
