import { CompleteDryRunResult, TestResult } from '@stryker-mutator/api/test-runner';
import { Mutant, CoveragePerTestId, MutantCoverage, StrykerOptions, MutantStatus } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import { I } from '@stryker-mutator/util';

import { coreTokens } from '../di/index.js';
import { StrictReporter } from '../reporters/strict-reporter.js';
import { Sandbox } from '../sandbox/index.js';

import { MutantRunPlan, MutantTestPlan } from './mutant-test-plan.js';

import { MutantEarlyResultPlan, PlanKind } from './index.js';

/**
 * The factor by which hit count from dry run is multiplied to calculate the hit limit for a mutant.
 * This is intentionally a high value to prevent false positives.
 *
 * For example, a property testing library might execute a failing scenario multiple times to determine the smallest possible counterexample.
 * @see https://jsverify.github.io/#minimal-counterexample
 */
const HIT_LIMIT_FACTOR = 100;

/**
 * Responsible for determining the tests to execute for each mutant, as well as other run option specific details
 *
 */
export class MutantTestPlanner {
  public static readonly inject = tokens(
    coreTokens.dryRunResult,
    coreTokens.reporter,
    coreTokens.sandbox,
    coreTokens.timeOverheadMS,
    commonTokens.options,
    commonTokens.logger
  );
  private readonly testsByMutantId: Map<string, Set<TestResult>>;
  private readonly hitsByMutantId: Map<string, number>;
  private readonly timeSpentAllTests: number;

  constructor(
    private readonly dryRunResult: CompleteDryRunResult,
    private readonly reporter: StrictReporter,
    private readonly sandbox: I<Sandbox>,
    private readonly timeOverheadMS: number,
    private readonly options: StrykerOptions,
    logger: Logger
  ) {
    this.testsByMutantId = findTestsByMutant(this.dryRunResult.mutantCoverage?.perTest, dryRunResult.tests, logger);
    this.hitsByMutantId = findHitsByMutantId(this.dryRunResult.mutantCoverage);
    this.timeSpentAllTests = calculateTotalTime(this.dryRunResult.tests);
  }

  public makePlan(mutants: readonly Mutant[]): readonly MutantTestPlan[] {
    const mutantTestPlans = mutants.map((mutant) => this.planMutant(mutant));
    this.reporter.onAllMutantsMatchedWithTests(mutantTestPlans.map(({ mutant }) => mutant));
    return mutantTestPlans;
  }

  private planMutant(mutant: Mutant): MutantTestPlan {
    // If mutant was already ignored, pass that along
    const isStatic = this.dryRunResult.mutantCoverage && this.dryRunResult.mutantCoverage.static[mutant.id] > 0;
    if (mutant.status) {
      // If this mutant was already ignored, early result
      return this.createMutantEarlyResultPlan(mutant, { isStatic, status: mutant.status, statusReason: mutant.statusReason });
    } else if (this.dryRunResult.mutantCoverage) {
      // If there was coverage information (coverageAnalysis not "off")
      const tests = this.testsByMutantId.get(mutant.id) ?? [];
      const coveredBy = toTestIds(tests);
      if (!isStatic || (this.options.ignoreStatic && coveredBy.length)) {
        // If not static, or it was "hybrid" (both static and perTest coverage) and ignoreStatic is on.
        // Only run covered tests
        const netTime = calculateTotalTime(tests);
        return this.createMutantRunPlan(mutant, { netTime, coveredBy, isStatic, testFilter: coveredBy });
      } else if (this.options.ignoreStatic) {
        // Static (w/o perTest coverage) and ignoreStatic is on -> Ignore.
        return this.createMutantEarlyResultPlan(mutant, {
          status: MutantStatus.Ignored,
          statusReason: 'Static mutant (and "ignoreStatic" was enabled)',
          isStatic,
          coveredBy,
        });
      } else {
        // Static (or hybrid) and `ignoreStatic` is off -> run all tests
        return this.createMutantRunPlan(mutant, { netTime: this.timeSpentAllTests, isStatic, coveredBy });
      }
    } else {
      // No coverage information exists, all tests need to run
      return this.createMutantRunPlan(mutant, { netTime: this.timeSpentAllTests });
    }
  }

  private createMutantEarlyResultPlan(
    mutant: Mutant,
    {
      isStatic,
      status,
      statusReason,
      coveredBy,
    }: { isStatic: boolean | undefined; status: MutantStatus; statusReason?: string; coveredBy?: string[] }
  ): MutantEarlyResultPlan {
    return {
      plan: PlanKind.EarlyResult,
      mutant: {
        ...mutant,
        status,
        static: isStatic,
        statusReason,
        coveredBy,
      },
    };
  }

  private createMutantRunPlan(
    mutant: Mutant,
    {
      netTime,
      testFilter,
      isStatic,
      coveredBy,
    }: { netTime: number; testFilter?: string[] | undefined; isStatic?: boolean | undefined; coveredBy?: string[] | undefined }
  ): MutantRunPlan {
    const { disableBail, timeoutMS, timeoutFactor } = this.options;
    const timeout = timeoutFactor * netTime + timeoutMS + this.timeOverheadMS;
    const hitCount = this.hitsByMutantId.get(mutant.id);
    const hitLimit = hitCount === undefined ? undefined : hitCount * HIT_LIMIT_FACTOR;

    return {
      plan: PlanKind.Run,
      mutant: {
        ...mutant,
        coveredBy,
        static: isStatic,
      },
      runOptions: {
        // Copy over relevant mutant fields, we don't want to copy over "static" and "coveredBy", test runners should only care about the testFilter
        activeMutant: {
          id: mutant.id,
          fileName: mutant.fileName,
          location: mutant.location,
          mutatorName: mutant.mutatorName,
          replacement: mutant.replacement,
        },
        timeout,
        testFilter,
        sandboxFileName: this.sandbox.sandboxFileFor(mutant.fileName),
        hitLimit,
        disableBail,
        reloadEnvironment: !testFilter,
      },
    };
  }
}
function findTestsByMutant(coveragePerTest: CoveragePerTestId | undefined, allTests: TestResult[], logger: Logger) {
  const testsByMutantId = new Map<string, Set<TestResult>>();
  const testsById = allTests.reduce((acc, test) => acc.set(test.id, test), new Map<string, TestResult>());
  coveragePerTest &&
    Object.entries(coveragePerTest).forEach(([testId, mutantCoverage]) => {
      const foundTest = testsById.get(testId);
      if (!foundTest) {
        logger.warn(
          `Found test with id "${testId}" in coverage data, but not in the test results of the dry run. Not taking coverage data for this test into account.`
        );
        return;
      }
      Object.entries(mutantCoverage).forEach(([mutantId, count]) => {
        if (count > 0) {
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
