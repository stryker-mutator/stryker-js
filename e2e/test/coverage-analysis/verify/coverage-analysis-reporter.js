const { PluginKind, declareClassPlugin } = require('@stryker-mutator/api/plugin');

class CoverageAnalysisReporter {
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
const strykerPlugins = [declareClassPlugin(PluginKind.Reporter, 'coverageAnalysis', CoverageAnalysisReporter)];
module.exports = {
  CoverageAnalysisReporter,
  strykerPlugins
};


