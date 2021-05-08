import { DryRunStatus, DryRunResult, DryRunOptions, MutantRunResult, MutantRunOptions, MutantRunStatus } from '@stryker-mutator/api/test-runner';
import { errorToString } from '@stryker-mutator/util';
import { getLogger } from 'log4js';

import { OutOfMemoryError } from '../child-proxy/out-of-memory-error';

import { TestRunnerDecorator } from './test-runner-decorator';

const ERROR_MESSAGE = 'Test runner crashed. Tried twice to restart it without any luck. Last time the error message was: ';

/**
 * Wraps a test runner and implements the retry functionality.
 */
export class RetryDecorator extends TestRunnerDecorator {
  private readonly log = getLogger(RetryDecorator.name);

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    const result = await this.run(() => super.dryRun(options));
    if (typeof result === 'string') {
      return {
        status: DryRunStatus.Error,
        errorMessage: result,
      };
    } else {
      return result;
    }
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    const result = await this.run(() => super.mutantRun(options));
    if (typeof result === 'string') {
      return {
        status: MutantRunStatus.Error,
        errorMessage: result,
      };
    } else {
      return result;
    }
  }

  private async run<T extends DryRunResult | MutantRunResult>(actRun: () => Promise<T>, attemptsLeft = 2, lastError?: unknown): Promise<T | string> {
    if (attemptsLeft > 0) {
      try {
        return await actRun();
      } catch (error) {
        if (error instanceof OutOfMemoryError) {
          this.log.info(
            "Test runner process [%s] ran out of memory. You probably have a memory leak in your tests. Don't worry, Stryker will restart the process, but you might want to investigate this later, because this decreases performance.",
            error.pid
          );
        }
        await this.recover();
        return this.run(actRun, attemptsLeft - 1, error);
      }
    } else {
      await this.recover();
      return `${ERROR_MESSAGE}${errorToString(lastError)}`;
    }
  }

  private async recover(): Promise<void> {
    await this.dispose();
    this.createInnerRunner();
    return this.init();
  }
}
