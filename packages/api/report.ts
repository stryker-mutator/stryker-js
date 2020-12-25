import * as mutationTestReportSchema from 'mutation-testing-report-schema';

export { default as Reporter } from './src/report/reporter';
export * from './src/report/mutant-result';
export { default as MutantStatus } from './src/report/mutant-status';
export { default as SourceFile } from './src/report/source-file';
export { default as MatchedMutant } from './src/report/matched-mutant';
export {
  /**
   * Types exported directly from mutation-testing-schema
   * @see https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/mutation-testing-report-schema
   */
  mutationTestReportSchema,
};
