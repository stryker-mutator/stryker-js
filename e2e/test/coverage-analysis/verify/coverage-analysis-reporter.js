import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export class CoverageAnalysisReporter {
  /**
   * @type {import('mutation-testing-report-schema').MutationTestResult}
   */
  report;
  /**
   * @type { CoverageAnalysisReporter }
   */
  static instance;
  
  constructor() {
    CoverageAnalysisReporter.instance = this;
  }
  
  /**
   * @param {import('mutation-testing-report-schema').MutationTestResult} report 
   * @returns {void}
   */
  onMutationTestReportReady(report) {
    this.report = report;
  }
}
export const strykerPlugins = [declareClassPlugin(PluginKind.Reporter, 'coverageAnalysis', CoverageAnalysisReporter)];

