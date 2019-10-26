export interface DashboardOptions {
  /**
   * Indicates which project to use if the "dashboard" reporter is enabled.
   */
  project?: string;
  /**
   * Indicates which version to use if the "dashboard" reporter is enabled.
   */
  version?: string;
  /**
   * Indicates which module to use if the "dashboard" reporter is enabled.
   */
  module?: string;
  /**
   * Indicates the base url of the stryker dashboard.
   */
  baseUrl: string;
  /**
   * Send a full report (inc. source code), rather than only the mutation score.
   */
  reportType: ReportType;
}

export enum ReportType {
  Full = 'full',
  MutationScore = 'mutationScore'
}

export const ALL_REPORT_TYPES = Object.freeze([ReportType.Full, ReportType.MutationScore]);
