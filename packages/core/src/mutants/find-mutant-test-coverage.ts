import { CompleteDryRunResult, TestResult } from '@stryker-mutator/api/test-runner';
import { Mutant, CoveragePerTestId, MutantTestCoverage, MutantCoverage, StrykerOptions, MutantStatus } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import { coreTokens } from '../di';
import { StrictReporter } from '../reporters/strict-reporter';

findMutantTestCoverage.inject = tokens(coreTokens.dryRunResult, coreTokens.mutants, coreTokens.reporter, commonTokens.options, commonTokens.logger);
export function findMutantTestCoverage(
  dryRunResult: CompleteDryRunResult,
  mutants: readonly Mutant[],
  reporter: StrictReporter,
  options: StrykerOptions,
  logger: Logger
): MutantTestCoverage[] {
  const mutantTestCoverage = mapToMutantTestCoverage(dryRunResult, mutants, options, logger);
  reporter.onAllMutantsMatchedWithTests(mutantTestCoverage);
  return mutantTestCoverage;
}

function mapToMutantTestCoverage(
  dryRunResult: CompleteDryRunResult,
  mutants: readonly Mutant[],
  options: StrykerOptions,
  logger: Logger
): MutantTestCoverage[] {
  const testsByMutantId = findTestsByMutant(dryRunResult.mutantCoverage?.perTest, dryRunResult.tests, logger);
  const hitsByMutantId = findHitsByMutantId(dryRunResult.mutantCoverage);
  const timeSpentAllTests = calculateTotalTime(dryRunResult.tests);

  const mutantCoverage = mutants.map((mutant): MutantTestCoverage => {
    // If mutant was already ignored, pass that along
    const hitCount = hitsByMutantId.get(mutant.id);
    const isStatic = dryRunResult.mutantCoverage && dryRunResult.mutantCoverage.static[mutant.id] > 0;
    if (mutant.status) {
      // If this mutant was already ignored, early result
      return {
        ...mutant,
        static: isStatic,
        hitCount,
        testFilter: undefined,
        estimatedNetTime: 0,
      };
    } else if (dryRunResult.mutantCoverage) {
      // If there was coverage information (coverageAnalysis not "off")
      const tests = testsByMutantId.get(mutant.id) ?? [];
      const coveredBy = toTestIds(tests);
      if (!isStatic || (options.ignoreStatic && coveredBy.length)) {
        // If not static, or it was "hybrid" (both static and perTest coverage) and ignoreStatic is on.
        // Only run covered tests
        const estimatedNetTime = calculateTotalTime(tests);
        return {
          ...mutant,
          static: isStatic,
          estimatedNetTime,
          hitCount,
          testFilter: coveredBy,
          coveredBy,
        };
      } else if (options.ignoreStatic) {
        // Static (w/o perTest coverage) and ignoreStatic is on -> Ignore.
        return {
          ...mutant,
          status: MutantStatus.Ignored,
          statusReason: 'Static mutant (and "ignoreStatic" was enabled)',
          static: isStatic,
          estimatedNetTime: 0,
          hitCount,
          testFilter: undefined, // since we're ignoring static, use the coveredBy as test filter.
          coveredBy,
        };
      } else {
        // Static (or hybrid) and `ignoreStatic` is off -> run all tests
        const estimatedNetTime = timeSpentAllTests;
        return {
          ...mutant,
          estimatedNetTime,
          hitCount,
          coveredBy,
          testFilter: undefined,
          static: isStatic,
        };
      }
    } else {
      // No coverage information exists, all tests need to run
      return {
        ...mutant,
        estimatedNetTime: timeSpentAllTests,
        testFilter: undefined,
        coveredBy: undefined,
        static: undefined,
        hitCount,
      };
    }
  });
  return mutantCoverage;
}

function findTestsByMutant(coveragePerTest: CoveragePerTestId | undefined, allTests: TestResult[], logger: Logger) {
  const testsByMutantId = new Map<string, Set<TestResult>>();
  coveragePerTest &&
    Object.entries(coveragePerTest).forEach(([testId, mutantCoverage]) => {
      const foundTest = allTests.find((test) => test.id === testId);
      if (!foundTest) {
        logger.debug(
          `Found test with id "${testId}" in coverage data, but not in the test results of the dry run. Not taking coverage data for this test into account`
        );
        return;
      }
      Object.entries(mutantCoverage).forEach(([mutantId, count]) => {
        if (count) {
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

/**
 * Find the number of hits per mutant. This is the total amount of times the mutant was executed during the dry test run.
 * @param coverageData The coverage data from the initial test run
 * @returns The hits by mutant id
 */
function findHitsByMutantId(coverageData: MutantCoverage | undefined): Map<string, number> {
  const hitsByMutant = new Map<string, number>();
  if (coverageData) {
    // We don't care about the exact tests in this case, just the total number of hits
    const coverageResultsPerMutant = [coverageData.static, ...Object.values(coverageData.perTest)];
    coverageResultsPerMutant.forEach((coverageByMutantId) => {
      Object.entries(coverageByMutantId).forEach(([mutantId, count]) => {
        hitsByMutant.set(mutantId, (hitsByMutant.get(mutantId) ?? 0) + count);
      });
    });
  }
  return hitsByMutant;
}
