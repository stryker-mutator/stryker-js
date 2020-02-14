import * as mutationTestReportSchema from 'mutation-testing-report-schema/dist/src/api';

export { default as Reporter } from './src/report/Reporter';
export { default as MutantResult } from './src/report/MutantResult';
export { default as MutantStatus } from './src/report/MutantStatus';
export { default as SourceFile } from './src/report/SourceFile';
export { default as MatchedMutant } from './src/report/MatchedMutant';
export {
  /**
   * Types exported directly from mutation-testing-schema
   * @see https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/mutation-testing-report-schema
   */
  mutationTestReportSchema
};
