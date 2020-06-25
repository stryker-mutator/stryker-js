import { CompleteDryRunResult, TestResult, CoveragePerTestId } from '@stryker-mutator/api/test_runner2';
import { Mutant } from '@stryker-mutator/api/core';
import { tokens } from '@stryker-mutator/api/plugin';

import { coreTokens } from '../di';

export interface MutantTestCoverage {
  estimatedNetTime: number;
  coveredByTests: boolean;
  testFilter?: string[];
  mutant: Mutant;
}

findMutantTestCoverage.inject = tokens(coreTokens.dryRunResult, coreTokens.mutants);
export function findMutantTestCoverage(dryRunResult: CompleteDryRunResult, mutants: readonly Mutant[]): MutantTestCoverage[] {
  const testsByMutantId = findTestsByMutant(dryRunResult.mutantCoverage?.perTest, dryRunResult.tests);
  const timeSpentAllTests = calculateTotalTime(dryRunResult.tests);

  return mutants.map((mutant) => {
    if (!dryRunResult.mutantCoverage || dryRunResult.mutantCoverage.static[mutant.id] > 0) {
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
}

function findTestsByMutant(coverageData: CoveragePerTestId | undefined, allTests: TestResult[]) {
  const testsByMutantId = new Map<number, Set<TestResult>>();
  coverageData &&
    Object.entries(coverageData).forEach(([testId, coverageData]) => {
      const test = allTests.find((test) => test.id === testId);
      if (!test) {
        throw new Error(
          `Found test with id "${testId}" in coverage data, but not in the test results of the dry run. This shouldn't happen! Please report the issue at the issue tracker of your stryker test runner`
        );
      }
      Object.entries(coverageData).forEach(([mutantIdAsString, count]) => {
        if (count) {
          const mutantId = parseInt(mutantIdAsString, 10);
          let tests = testsByMutantId.get(mutantId);
          if (!tests) {
            tests = new Set();
            testsByMutantId.set(mutantId, tests);
          }
          tests.add(test);
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
