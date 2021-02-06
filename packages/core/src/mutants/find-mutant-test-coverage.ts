import { CompleteDryRunResult, TestResult } from '@stryker-mutator/api/test-runner';
import { Mutant, CoveragePerTestId } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { MatchedMutant } from '@stryker-mutator/api/report';

import { Logger } from '@stryker-mutator/api/logging';

import { coreTokens } from '../di';
import { StrictReporter } from '../reporters/strict-reporter';

export interface MutantTestCoverage {
  estimatedNetTime: number;
  coveredByTests: boolean;
  testFilter?: string[];
  mutant: Mutant;
}

findMutantTestCoverage.inject = tokens(coreTokens.dryRunResult, coreTokens.mutants, coreTokens.reporter, commonTokens.logger);
export function findMutantTestCoverage(
  dryRunResult: CompleteDryRunResult,
  mutants: readonly Mutant[],
  reporter: StrictReporter,
  logger: Logger
): MutantTestCoverage[] {
  const mutantTestCoverage = mapToMutantTestCoverage(dryRunResult, mutants, logger);
  reporter.onAllMutantsMatchedWithTests(mutantTestCoverage.map(toMatchedMutant));
  return mutantTestCoverage;
}

function toMatchedMutant({ mutant, testFilter, coveredByTests, estimatedNetTime }: MutantTestCoverage): MatchedMutant {
  return {
    fileName: mutant.fileName,
    id: mutant.id.toString(),
    mutatorName: mutant.mutatorName,
    replacement: mutant.replacement,
    runAllTests: !testFilter && coveredByTests,
    testFilter: testFilter,
    timeSpentScopedTests: estimatedNetTime,
  };
}

function mapToMutantTestCoverage(dryRunResult: CompleteDryRunResult, mutants: readonly Mutant[], logger: Logger) {
  const testsByMutantId = findTestsByMutant(dryRunResult.mutantCoverage?.perTest, dryRunResult.tests, logger);
  const timeSpentAllTests = calculateTotalTime(dryRunResult.tests);

  const mutantCoverage = mutants.map((mutant) => {
    if (mutant.ignoreReason !== undefined) {
      return {
        mutant,
        estimatedNetTime: 0,
        coveredByTests: false,
      };
    } else if (!dryRunResult.mutantCoverage || dryRunResult.mutantCoverage.static[mutant.id] > 0) {
      return {
        mutant,
        estimatedNetTime: timeSpentAllTests,
        testFilter: undefined,
        coveredByTests: true,
      };
    } else {
      const tests = testsByMutantId.get(mutant.id);
      if (tests && tests.size > 0) {
        return {
          mutant,
          estimatedNetTime: calculateTotalTime(tests),
          testFilter: toTestIds(tests),
          coveredByTests: true,
        };
      } else {
        return {
          mutant,
          estimatedNetTime: 0,
          testFilter: undefined,
          coveredByTests: false,
        };
      }
    }
  });
  return mutantCoverage;
}

function findTestsByMutant(coveragePerTest: CoveragePerTestId | undefined, allTests: TestResult[], logger: Logger) {
  const testsByMutantId = new Map<number, Set<TestResult>>();
  coveragePerTest &&
    Object.entries(coveragePerTest).forEach(([testId, mutantCoverage]) => {
      const foundTest = allTests.find((test) => test.id === testId);
      if (!foundTest) {
        logger.debug(
          `Found test with id "${testId}" in coverage data, but not in the test results of the dry run. Not taking coverage data for this test into account`
        );
        return;
      }
      Object.entries(mutantCoverage).forEach(([mutantIdAsString, count]) => {
        if (count) {
          const mutantId = parseInt(mutantIdAsString, 10);
          let tests = testsByMutantId.get(mutantId);
          if (!tests) {
            tests = new Set();
            testsByMutantId.set(mutantId, tests);
          }
          tests.add(foundTest);
        }
      });
    });
  return testsByMutantId;
}

function calculateTotalTime(testResults: Iterable<TestResult>): number {
  let total = 0;
  for (const test of testResults) {
    total += test.timeSpentMs;
  }
  return total;
}

function toTestIds(testResults: Iterable<TestResult>): string[] {
  const result = [];
  for (const test of testResults) {
    result.push(test.id);
  }
  return result;
}
