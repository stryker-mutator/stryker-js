import { RunOptions, RunResult, RunStatus } from 'stryker-api/test_runner';
import TestRunnerDecorator from './TestRunnerDecorator';
import { errorToString } from '../utils/objectUtils';

const ERROR_MESSAGE = 'Test runner crashed. Tried twice to restart it without any luck. Last time the error message was: ';

/**
 * Wraps a test runner and implements the retry functionality.
 */
export default class RetryDecorator extends TestRunnerDecorator {

  async run(options: RunOptions, attemptsLeft = 2, lastError?: Error): Promise<RunResult> {
    if (attemptsLeft > 0) {
      try {
        return await this.innerRunner.run(options);
      } catch (error) {
        await this.recover();
        return this.run(options, attemptsLeft - 1, error);
      }
    } else {
      await this.recover();
      return { status: RunStatus.Error, errorMessages: [ERROR_MESSAGE + errorToString(lastError)], tests: [] };
    }
  }

  private async recover(): Promise<void> {
    await this.dispose();
    this.createInnerRunner();
    return this.init();
  }
}
