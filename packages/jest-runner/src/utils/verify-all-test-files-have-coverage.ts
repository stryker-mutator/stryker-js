import path from 'path';

import type { AggregatedResult } from '@jest/test-result';

/**
 * Verifies that coverage is reported for all files and, if not, will return an error message
 * @param results The jest test run result
 * @param fileNamesWithMutantCoverage the file names for which coverage was reported
 */
export function verifyAllTestFilesHaveCoverage(
  results: AggregatedResult,
  fileNamesWithMutantCoverage: Set<string>,
): string | undefined {
  const allTestFiles = new Set<string>(
    results.testResults.map(({ testFilePath }) => path.resolve(testFilePath)),
  );
  const fullFileNamesWithCoverage = [...fileNamesWithMutantCoverage].map(
    (fileName) => path.resolve(fileName),
  );
  const missing = [...allTestFiles].filter(
    (testFile) => !fullFileNamesWithCoverage.includes(testFile),
  );
  if (missing.length > 0) {
    return formatError(missing);
  } else {
    return;
  }
}

const MAX_FILES_IN_HINT = 3;
function formatError(coverageMissingFromFiles: string[]) {
  let fileHints = coverageMissingFromFiles
    .slice(0, MAX_FILES_IN_HINT)
    .map((fullName) => `  * ${path.relative(process.cwd(), fullName)}`)
    .join('\n');
  if (coverageMissingFromFiles.length > MAX_FILES_IN_HINT) {
    fileHints += `\n  (and ${coverageMissingFromFiles.length - MAX_FILES_IN_HINT} more)`;
  }
  return `\nMissing coverage results for:
${fileHints}

You probably configured a test environment in jest that is not reporting code coverage to Stryker. 
See also https://jestjs.io/docs/en/configuration.html#testenvironment-string

Are you using node, jsdom or jsdom-sixteen as a test environment? Please change that:
  * node -> @stryker-mutator/jest-runner/jest-env/node
  * jsdom -> @stryker-mutator/jest-runner/jest-env/jsdom
  * jest-environment-jsdom-sixteen -> @stryker-mutator/jest-runner/jest-env/jsdom-sixteen

If you're using your own custom test environment, please enrich the environment with this mixin: 

const { mixinJestEnvironment} = require('@stryker-mutator/jest-runner');
module.exports = mixinJestEnvironment(MyCustomTestEnvironment);

For more info, see https://stryker-mutator.io/docs/stryker-js/jest-runner#coverage-analysis`;
}
