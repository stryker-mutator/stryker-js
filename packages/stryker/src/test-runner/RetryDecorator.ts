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

  private tryRun(options: RunOptions, retriesLeft = 2, lastError?: any) {
    if (retriesLeft > 0) {
      this.innerRunner.run(options).then(result =>
        this.currentRunTask.resolve(result),
        rejectReason => {
          if (this.innerProcessIsCrashed(rejectReason)) {
            this.recover().then(
              () => this.tryRun(options, retriesLeft - 1, rejectReason),
              reason => this.currentRunTask.reject(reason));
          } else {
            // Oops... not intended to catch this one
            this.currentRunTask.reject(rejectReason);
          }
        });
    } else {
      this.recover().then(
        () => this.currentRunTask.resolve({ status: RunStatus.Error, errorMessages: [ERROR_MESSAGE + errorToString(lastError)], tests: [] }),
        (reason) => this.currentRunTask.reject(reason));
    }
  }

  private recover(): Promise<void> {
    this.createInnerRunner();
    return this.init();
  }
}
