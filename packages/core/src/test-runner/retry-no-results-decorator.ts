import { Logger } from '@stryker-mutator/api/logging';
import { MutantRunOptions, MutantRunResult, MutantRunStatus, TestRunner } from '@stryker-mutator/api/test-runner';

import { MAX_RETRIES } from './retry-rejected-decorator';
import { TestRunnerDecorator } from './test-runner-decorator';

const errorMessage = `Tried ${MAX_RETRIES} test runs, but both failed to run actual tests`;

/**
 * Implements the retry functionality whenever an internal test runner fails to execute tests during mutation testing.
 * This can happen in the karma test runner
 * @see https://github.com/stryker-mutator/stryker-js/issues/2989#issuecomment-885461482
 */
export class RetryNoResultsDecorator extends TestRunnerDecorator {
  constructor(testRunnerProducer: () => TestRunner, private readonly log: Logger) {
    super(testRunnerProducer);
  }

  public override async mutantRun(options: MutantRunOptions, attemptsLeft = MAX_RETRIES): Promise<MutantRunResult> {
    if (attemptsLeft > 0) {
      const result = await this.innerRunner.mutantRun(options);
      if (result.status === MutantRunStatus.Survived && result.nrOfTests === 0) {
        this.log.debug(`Detected an empty result for mutant ${options.activeMutant.id}, retrying ${attemptsLeft - 1} more time(s).`);
        await this.recover();
        return this.mutantRun(options, attemptsLeft - 1);
      }
      return result;
    } else {
      this.log.debug(`Detected an empty result for mutant ${options.activeMutant.id} for ${MAX_RETRIES} time(s). Reporting it as a Runtime error.`);
      return {
        status: MutantRunStatus.Error,
        errorMessage,
      };
    }
  }
}
