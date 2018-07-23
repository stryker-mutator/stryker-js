import { RunOptions, RunResult, RunStatus } from 'stryker-api/test_runner';
import { errorToString } from '../utils/objectUtils';
import TestRunnerDecorator from './TestRunnerDecorator';
import Task from '../utils/Task';
import ChildProcessCrashedError from '../child-proxy/ChildProcessCrashedError';

const ERROR_MESSAGE = 'Test runner crashed. Tried twice to restart it without any luck. Last time the error message was: ';

/**
 * Wraps a test runner and implements the retry functionality.
 */
export default class RetryDecorator extends TestRunnerDecorator {
  private currentRunTask: Task<RunResult>;

  run(options: RunOptions): Promise<RunResult> {
    this.currentRunTask = new Task<RunResult>();
    this.tryRun(options);
    return this.currentRunTask.promise;
  }

  dispose(): Promise<void> {
    return super.dispose().catch(err => {
      if (this.innerProcessIsCrashed(err)) {
        return null;
      } else {
        // Oops, not intended to catch this one. Pass through
        throw err;
      }
    });
  }

  private innerProcessIsCrashed(error: any) {
    return error instanceof ChildProcessCrashedError;
  }

  private async tryRun(options: RunOptions, attemptsLeft = 2, lastError?: any) {
    if (attemptsLeft > 0) {
      try {
        let result = await this.innerRunner.run(options);
        this.currentRunTask.resolve(result);
      } catch (error) {
        await this.recover();
        await this.tryRun(options, attemptsLeft - 1, error);
      }
    } else {
      await this.recover();
      this.currentRunTask.resolve({ status: RunStatus.Error, errorMessages: [ERROR_MESSAGE + errorToString(lastError)], tests: [] });
    }
  }

  private recover(): Promise<void> {
    this.createInnerRunner();
    return this.init();
  }
}
