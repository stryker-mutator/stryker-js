import {
  DryRunStatus,
  DryRunResult,
  DryRunOptions,
  MutantRunOptions,
  MutantRunResult,
  MutantRunStatus,
  TestRunner,
} from '@stryker-mutator/api/test-runner';
import { ExpirableTask } from '@stryker-mutator/util';

import { Timer } from '../utils/timer.js';

import { TestRunnerDecorator } from './test-runner-decorator.js';
import { Logger } from '@stryker-mutator/api/logging';

/**
 * Wraps a test runner and implements the timeout functionality.
 */
export class TimeoutDecorator extends TestRunnerDecorator {
  constructor(
    private readonly log: Logger,
    producer: () => TestRunner,
  ) {
    super(producer);
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    const { result } = await this.run(options, () => super.dryRun(options));
    if (result === ExpirableTask.TimeoutExpired) {
      return {
        status: DryRunStatus.Timeout,
      };
    } else {
      return result;
    }
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    const { result, elapsedMs } = await this.run(options, () =>
      super.mutantRun(options),
    );
    if (result === ExpirableTask.TimeoutExpired) {
      return {
        status: MutantRunStatus.Timeout,
        duration: elapsedMs,
      };
    } else if (
      result.status === MutantRunStatus.Timeout &&
      result.duration === undefined
    ) {
      // For example, a timeout because the hit limit was reached
      return { ...result, duration: elapsedMs };
    } else {
      return result;
    }
  }

  private async run<TResult>(
    options: { timeout: number },
    actRun: () => Promise<TResult>,
  ): Promise<{
    result: TResult | typeof ExpirableTask.TimeoutExpired;
    elapsedMs: number;
  }> {
    this.log.debug(
      'Starting timeout timer (%s ms) for a test run',
      options.timeout,
    );
    const timer = new Timer();
    const result = await ExpirableTask.timeout(actRun(), options.timeout);
    const elapsedMs = timer.elapsedMs();
    if (result === ExpirableTask.TimeoutExpired) {
      await this.handleTimeout();
    }
    return { result, elapsedMs };
  }

  private async handleTimeout(): Promise<void> {
    this.log.debug(
      'Timeout expired, restarting the process and reporting timeout',
    );
    await this.recover();
  }
}
