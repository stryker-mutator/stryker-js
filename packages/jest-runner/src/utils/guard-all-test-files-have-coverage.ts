import path = require('path');

import { AggregatedResult } from '@jest/test-result';

export function guardAllTestFilesHaveCoverage(results: AggregatedResult, fileNamesWithMutantCoverage: string[]) {
  const allTestFiles = new Set<string>(results.testResults.map(({ testFilePath }) => path.resolve(testFilePath)));
  const missing = [...allTestFiles].filter((testFile) => !fileNamesWithMutantCoverage.includes(testFile));
  if (missing.length > 0) {
    throw new Error(`Missing coverage results of ${missing.join(', ')}`);
  }
}
