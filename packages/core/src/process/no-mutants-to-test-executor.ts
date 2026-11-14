import {
  Mutant,
  MutantEarlyResultPlan,
  MutantResult,
  PlanKind,
} from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { I } from '@stryker-mutator/util';

import { coreTokens } from '../di/index.js';
import { Project } from '../fs/index.js';
import {
  diffWithIncrementalReport,
  IncrementalDiffer,
  TestCoverage,
} from '../mutants/index.js';
import { MutationTestReportHelper } from '../reporters/mutation-test-report-helper.js';
import { StrictReporter } from '../reporters/strict-reporter.js';
import { Timer } from '../utils/timer.js';

/**
 * Reports the results when instrumentation found no mutants that need testing.
 * It skips the checkers, the sandbox, the dry run and the mutation test phase,
 * but still writes all configured reports (including the incremental report).
 */
export class NoMutantsToTestExecutor {
  public static readonly inject = tokens(
    coreTokens.mutants,
    coreTokens.project,
    coreTokens.testCoverage,
    coreTokens.incrementalDiffer,
    coreTokens.mutationTestReportHelper,
    coreTokens.reporter,
    coreTokens.timer,
    commonTokens.logger,
  );

  constructor(
    private readonly mutants: readonly Mutant[],
    private readonly project: I<Project>,
    private readonly testCoverage: I<TestCoverage>,
    private readonly incrementalDiffer: I<IncrementalDiffer>,
    private readonly mutationTestReportHelper: I<MutationTestReportHelper>,
    private readonly reporter: StrictReporter,
    private readonly timer: I<Timer>,
    private readonly log: Logger,
  ) {}

  public async execute(): Promise<MutantResult[]> {
    const mutants = await diffWithIncrementalReport(
      this.mutants,
      this.project,
      this.testCoverage,
      this.incrementalDiffer,
    );
    const mutantPlans = mutants.map(toEarlyResultPlan);
    this.reporter.onMutationTestingPlanReady({ mutantPlans });
    const results = mutantPlans.map(({ mutant }) =>
      this.mutationTestReportHelper.reportMutantStatus(mutant, mutant.status),
    );
    await this.mutationTestReportHelper.reportAll(results);
    await this.reporter.wrapUp();
    this.log.info('Done in %s.', this.timer.humanReadableElapsed());
    return results;
  }
}

function toEarlyResultPlan(mutant: Mutant): MutantEarlyResultPlan {
  if (!mutant.status) {
    throw new Error(
      `Mutant ${mutant.id} in ${mutant.fileName} has no status, it cannot be reported without testing it.`,
    );
  }
  return {
    plan: PlanKind.EarlyResult,
    mutant: { ...mutant, status: mutant.status, static: false },
  };
}
