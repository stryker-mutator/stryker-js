import {
  MutantResult,
  MutantRunPlan,
  MutantTestPlan,
  PlanKind,
} from '@stryker-mutator/api/core';
import {
  DryRunCompletedEvent,
  MutationTestingPlanReadyEvent,
  Reporter,
  RunTiming,
} from '@stryker-mutator/api/report';
import { TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';

import { Timer } from '../utils/timer.js';

export abstract class ProgressKeeper implements Reporter {
  private timer!: Timer;
  private timing!: RunTiming;
  private capabilities!: TestRunnerCapabilities;
  private ticksByMutantId!: Map<string, number>;
  protected progress = {
    survived: 0,
    timedOut: 0,
    tested: 0,
    mutants: 0,
    total: 0,
    ticks: 0,
  };

  public onDryRunCompleted({
    timing,
    capabilities,
  }: DryRunCompletedEvent): void {
    this.timing = timing;
    this.capabilities = capabilities;
  }

  /**
   * An event emitted when the mutant test plan is calculated.
   * @param event The mutant test plan ready event
   */
  public onMutationTestingPlanReady({
    mutantPlans,
  }: MutationTestingPlanReadyEvent): void {
    this.timer = new Timer();
    this.ticksByMutantId = new Map(
      mutantPlans.filter(isRunPlan).map(({ netTime, mutant, runOptions }) => {
        let ticks = netTime;
        if (
          !this.capabilities.reloadEnvironment &&
          runOptions.reloadEnvironment
        ) {
          ticks += this.timing.overhead;
        }
        return [mutant.id, ticks];
      }),
    );
    this.progress.mutants = this.ticksByMutantId.size;
    this.progress.total = [...this.ticksByMutantId.values()].reduce(
      (acc, n) => acc + n,
      0,
    );
  }

  public onMutantTested(result: MutantResult): number {
    const ticks = this.ticksByMutantId.get(result.id);
    if (ticks !== undefined) {
      this.progress.tested++;
      this.progress.ticks += this.ticksByMutantId.get(result.id) ?? 0;
      if (result.status === 'Survived') {
        this.progress.survived++;
      }
      if (result.status === 'Timeout') {
        this.progress.timedOut++;
      }
    }
    return ticks ?? 0;
  }

  protected getElapsedTime(): string {
    return this.formatTime(this.timer.elapsedSeconds());
  }

  protected getEtc(): string {
    const totalSecondsLeft = Math.floor(
      (this.timer.elapsedSeconds() / this.progress.ticks) *
        (this.progress.total - this.progress.ticks),
    );

    if (isFinite(totalSecondsLeft) && totalSecondsLeft > 0) {
      return this.formatTime(totalSecondsLeft);
    } else {
      return 'n/a';
    }
  }

  private formatTime(timeInSeconds: number) {
    const hours = Math.floor(timeInSeconds / 3600);

    const minutes = Math.floor((timeInSeconds % 3600) / 60);

    return hours > 0 // conditional time formatting
      ? `~${hours}h ${minutes}m`
      : minutes > 0
        ? `~${minutes}m`
        : '<1m';
  }
}

function isRunPlan(mutantPlan: MutantTestPlan): mutantPlan is MutantRunPlan {
  return mutantPlan.plan === PlanKind.Run;
}
