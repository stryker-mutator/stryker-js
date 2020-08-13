import * as mutationTestReportSchema from 'mutation-testing-report-schema/dist/src/api';

export { Reporter } from './src/report/Reporter';
export { MutantResult } from './src/report/MutantResult';
export { MutantStatus } from './src/report/MutantStatus';
export { SourceFile } from './src/report/SourceFile';
export { MatchedMutant } from './src/report/MatchedMutant';
export {
  /**
   * Types exported directly from mutation-testing-schema
   * @see https://github.com/stryker-mutator/mutation-testing-elements/tree/master/packages/mutation-testing-report-schema
   */
  mutationTestReportSchema,
};
