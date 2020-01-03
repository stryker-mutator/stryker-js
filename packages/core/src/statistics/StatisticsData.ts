export interface StatisticsData {
  implementation: 'Stryker';
  testRunner?: string;
  version?: string;
  score?: number;
  duration?: number;
  errorType?: string;
  errorMessage?: string;
}
