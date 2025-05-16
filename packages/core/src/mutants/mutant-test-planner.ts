import path from 'path';

import { TestResult } from '@stryker-mutator/api/test-runner';
import {
  MutantRunPlan,
  MutantTestPlan,
  PlanKind,
  Mutant,
  StrykerOptions,
  MutantStatus,
  MutantEarlyResultPlan,
} from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { I, notEmpty, split } from '@stryker-mutator/util';

import { coreTokens } from '../di/index.js';
import { StrictReporter } from '../reporters/strict-reporter.js';
import { Sandbox } from '../sandbox/index.js';
import { objectUtils } from '../utils/object-utils.js';
import { optionsPath } from '../utils/index.js';
import { Project } from '../fs/project.js';

import {
  IncrementalDiffer,
  toRelativeNormalizedFileName,
} from './incremental-differ.js';
import { TestCoverage } from './test-coverage.js';

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
    coreTokens.testCoverage,
    coreTokens.incrementalDiffer,
    coreTokens.reporter,
    coreTokens.sandbox,
    coreTokens.project,
    coreTokens.timeOverheadMS,
    commonTokens.options,
    commonTokens.logger,
  );
  private readonly timeSpentAllTests: number;

  constructor(
    private readonly testCoverage: I<TestCoverage>,
    private readonly incrementalDiffer: IncrementalDiffer,
    private readonly reporter: StrictReporter,
    private readonly sandbox: I<Sandbox>,
    private readonly project: I<Project>,
    private readonly timeOverheadMS: number,
    private readonly options: StrykerOptions,
    private readonly logger: Logger,
  ) {
    this.timeSpentAllTests = calculateTotalTime(
      this.testCoverage.testsById.values(),
    );
  }

  public async makePlan(
    mutants: readonly Mutant[],
  ): Promise<readonly MutantTestPlan[]> {
    const mutantsDiff = await this.incrementalDiff(mutants);
    const mutantPlans = mutantsDiff.map((mutant) => this.planMutant(mutant));
    this.reporter.onMutationTestingPlanReady({ mutantPlans });
    this.warnAboutSlow(mutantPlans);
    return mutantPlans;
  }

  private planMutant(mutant: Mutant): MutantTestPlan {
    const isStatic = this.testCoverage.hasStaticCoverage(mutant.id);

    if (mutant.status) {
      // If this mutant was already ignored, early result
      return this.createMutantEarlyResultPlan(mutant, {
        isStatic,
        coveredBy: mutant.coveredBy,
        killedBy: mutant.killedBy,
        status: mutant.status,
        statusReason: mutant.statusReason,
      });
    } else if (this.testCoverage.hasCoverage) {
      // If there was coverage information (coverageAnalysis not "off")
      const tests = this.testCoverage.testsByMutantId.get(mutant.id) ?? [];
      const coveredBy = toTestIds(tests);
      if (!isStatic || (this.options.ignoreStatic && coveredBy.length)) {
        // If not static, or it was "hybrid" (both static and perTest coverage) and ignoreStatic is on.
        // Only run covered tests with mutant active during runtime
        const netTime = calculateTotalTime(tests);
        return this.createMutantRunPlan(mutant, {
          netTime,
          coveredBy,
          isStatic,
          testFilter: coveredBy,
        });
      } else if (this.options.ignoreStatic) {
        // Static (w/o perTest coverage) and ignoreStatic is on -> Ignore.
        return this.createMutantEarlyResultPlan(mutant, {
          status: 'Ignored',
          statusReason: 'Static mutant (and "ignoreStatic" was enabled)',
          isStatic,
          coveredBy,
        });
      } else {
        // Static (or hybrid) and `ignoreStatic` is off -> run all tests
        return this.createMutantRunPlan(mutant, {
          netTime: this.timeSpentAllTests,
          isStatic,
          coveredBy,
        });
      }
    } else {
      // No coverage information exists, all tests need to run
      return this.createMutantRunPlan(mutant, {
        netTime: this.timeSpentAllTests,
      });
    }
  }

  private createMutantEarlyResultPlan(
    mutant: Mutant,
    {
      isStatic,
      status,
      statusReason,
      coveredBy,
      killedBy,
    }: {
      isStatic: boolean | undefined;
      status: MutantStatus;
      statusReason?: string;
      coveredBy?: string[];
      killedBy?: string[];
    },
  ): MutantEarlyResultPlan {
    return {
      plan: PlanKind.EarlyResult,
      mutant: {
        ...mutant,
        status,
        static: isStatic,
        statusReason,
        coveredBy,
        killedBy,
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
    }: {
      netTime: number;
      testFilter?: string[] | undefined;
      isStatic?: boolean | undefined;
      coveredBy?: string[] | undefined;
    },
  ): MutantRunPlan {
    const { disableBail, timeoutMS, timeoutFactor } = this.options;
    const timeout = timeoutFactor * netTime + timeoutMS + this.timeOverheadMS;
    const hitCount = this.testCoverage.hitsByMutantId.get(mutant.id);
    const hitLimit =
      hitCount === undefined ? undefined : hitCount * HIT_LIMIT_FACTOR;

    return {
      plan: PlanKind.Run,
      netTime,
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
        mutantActivation: testFilter ? 'runtime' : 'static',
        timeout,
        testFilter,
        sandboxFileName: this.sandbox.sandboxFileFor(mutant.fileName),
        hitLimit,
        disableBail,
        reloadEnvironment: !testFilter,
      },
    };
  }

  private warnAboutSlow(mutantPlans: readonly MutantTestPlan[]) {
    if (
      !this.options.ignoreStatic &&
      objectUtils.isWarningEnabled('slow', this.options.warnings)
    ) {
      // Only warn when the estimated time to run all static mutants exceeds 40%
      // ... and when the average performance impact of a static mutant is estimated to be twice that (or more) of a non-static mutant
      const ABSOLUTE_CUT_OFF_PERUNAGE = 0.4;
      const RELATIVE_CUT_OFF_FACTOR = 2;
      const zeroIfNaN = (n: number) => (isNaN(n) ? 0 : n);
      const totalNetTime = (runPlans: MutantRunPlan[]) =>
        runPlans.reduce((acc, { netTime }) => acc + netTime, 0);
      const runPlans = mutantPlans.filter(isRunPlan);
      const [staticRunPlans, runTimeRunPlans] = split(runPlans, ({ mutant }) =>
        Boolean(mutant.static),
      );
      const estimatedTimeForStaticMutants = totalNetTime(staticRunPlans);
      const estimatedTimeForRunTimeMutants = totalNetTime(runTimeRunPlans);
      const estimatedTotalTime =
        estimatedTimeForRunTimeMutants + estimatedTimeForStaticMutants;
      const avgTimeForAStaticMutant = zeroIfNaN(
        estimatedTimeForStaticMutants / staticRunPlans.length,
      );
      const avgTimeForARunTimeMutant = zeroIfNaN(
        estimatedTimeForRunTimeMutants / runTimeRunPlans.length,
      );
      const relativeTimeForStaticMutants =
        estimatedTimeForStaticMutants / estimatedTotalTime;
      const absoluteCondition =
        relativeTimeForStaticMutants >= ABSOLUTE_CUT_OFF_PERUNAGE;
      const relativeCondition =
        avgTimeForAStaticMutant >=
        RELATIVE_CUT_OFF_FACTOR * avgTimeForARunTimeMutant;
      if (relativeCondition && absoluteCondition) {
        const percentage = (perunage: number) => Math.round(perunage * 100);
        this.logger.warn(
          `Detected ${staticRunPlans.length} static mutants (${percentage(
            staticRunPlans.length / runPlans.length,
          )}% of total) that are estimated to take ${percentage(
            relativeTimeForStaticMutants,
          )}% of the time running the tests!\n  You might want to enable "ignoreStatic" to ignore these static mutants for your next run. \n  For more information about static mutants visit: https://stryker-mutator.io/docs/mutation-testing-elements/static-mutants\n  (disable "${optionsPath(
            'warnings',
            'slow',
          )}" to ignore this warning)`,
        );
      }
    }
  }

  private async incrementalDiff(
    currentMutants: readonly Mutant[],
  ): Promise<readonly Mutant[]> {
    const { incrementalReport } = this.project;

    if (incrementalReport) {
      const currentFiles = await this.readAllOriginalFiles(
        currentMutants,
        this.testCoverage.testsById.values(),
        Object.keys(incrementalReport.files),
        Object.keys(incrementalReport.testFiles ?? {}),
      );
      const diffedMutants = this.incrementalDiffer.diff(
        currentMutants,
        this.testCoverage,
        incrementalReport,
        currentFiles,
      );

      return diffedMutants;
    }
    return currentMutants;
  }

  private async readAllOriginalFiles(
    ...thingsWithFileNamesOrFileNames: Array<
      Iterable<string | { fileName?: string }>
    >
  ): Promise<Map<string, string>> {
    const uniqueFileNames = [
      ...new Set(
        thingsWithFileNamesOrFileNames
          .flatMap((container) =>
            [...container].map((thing) =>
              typeof thing === 'string' ? thing : thing.fileName,
            ),
          )
          .filter(notEmpty)
          .map((fileName) => path.resolve(fileName)),
      ),
    ];
    const result = await Promise.all(
      uniqueFileNames.map(async (fileName) => {
        const originalContent = await this.project.files
          .get(fileName)
          ?.readOriginal();
        if (originalContent) {
          return [
            toRelativeNormalizedFileName(fileName),
            originalContent,
          ] as const;
        } else {
          return undefined;
        }
      }),
    );

    return new Map(result.filter(notEmpty));
  }
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

export function isEarlyResult(
  mutantPlan: MutantTestPlan,
): mutantPlan is MutantEarlyResultPlan {
  return mutantPlan.plan === PlanKind.EarlyResult;
}
export function isRunPlan(
  mutantPlan: MutantTestPlan,
): mutantPlan is MutantRunPlan {
  return mutantPlan.plan === PlanKind.Run;
}
