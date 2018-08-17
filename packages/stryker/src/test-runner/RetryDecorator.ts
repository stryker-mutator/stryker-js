import { RunOptions, RunResult, RunStatus } from 'stryker-api/test_runner';
import TestRunnerDecorator from './TestRunnerDecorator';
import { errorToString } from '../utils/objectUtils';
import OutOfMemoryError from '../child-proxy/OutOfMemoryError';
import { getLogger } from 'stryker-api/logging';

const ERROR_MESSAGE = 'Test runner crashed. Tried twice to restart it without any luck. Last time the error message was: ';

/**
 * Wraps a test runner and implements the retry functionality.
 */
export default class RetryDecorator extends TestRunnerDecorator {

  log = getLogger(RetryDecorator.name);

  async run(options: RunOptions, attemptsLeft = 2, lastError?: Error): Promise<RunResult> {
    if (attemptsLeft > 0) {
      try {
        return await this.innerRunner.run(options);
      } catch (error) {
        if (error instanceof OutOfMemoryError) {
          this.log.info('Test runner process [%s] ran out of memory. You probably have a memory leak in your tests. Don\'t worry, Stryker will restart the process, but you might want to investigate this later, because this decreases performance.', error.pid);
        }
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
