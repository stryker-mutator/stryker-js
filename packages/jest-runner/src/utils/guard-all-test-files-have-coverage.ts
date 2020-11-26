import path = require('path');

import { AggregatedResult } from '@jest/test-result';

import { CoverageAnalysis } from '@stryker-mutator/api/core';

import { SingleFileMutantCoverage } from '../messaging';

export function guardAllTestFilesHaveCoverage(
  coverageAnalysis: CoverageAnalysis,
  results: AggregatedResult,
  mutantCoverageReports: SingleFileMutantCoverage[]
) {
  if (coverageAnalysis !== 'off') {
    const allTestFiles = new Set<string>(results.testResults.map(({ testFilePath }) => path.resolve(testFilePath)));
    const missing = [...allTestFiles].filter((testFile) => !mutantCoverageReports.some(({ fileName }) => testFile === fileName));
    if (missing.length > 0) {
      throw new Error(`Missing coverage results of ${missing.join(', ')}`);
    }
  }
}
