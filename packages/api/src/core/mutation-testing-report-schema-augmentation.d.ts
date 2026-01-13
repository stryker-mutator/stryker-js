// Augment the mutation-testing-report-schema types with Stryker-specific additions.
// This allows us to type the "performance" field added to mutation test reports.
export {};

declare module 'mutation-testing-report-schema/api' {
  export interface PerformanceStatistics {
    setup: number;
    initialRun: number;
    mutation: number;
  }
}


