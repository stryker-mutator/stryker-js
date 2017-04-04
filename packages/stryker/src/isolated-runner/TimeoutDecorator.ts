import { RunOptions, RunResult, RunStatus } from 'stryker-api/test_runner';
import { isPromise } from '../utils/objectUtils';
import Task from '../utils/Task';
import TestRunnerDecorator from './TestRunnerDecorator';

const MAX_WAIT_FOR_DISPOSE = 2500;

/**
 * Wraps a test runner and implements the timeout functionality.
 */
export default class TimeoutDecorator extends TestRunnerDecorator {

  run(options: RunOptions): Promise<RunResult> {
    const runTask = new Task<RunResult>(options.timeout, () => this.handleTimeout());
    runTask.chainTo(super.run(options));
    return runTask.promise;
  }

  dispose(): Promise<any> {
    return this.proxy(() => super.dispose(), MAX_WAIT_FOR_DISPOSE);
  }

  private proxy(action?: () => Promise<void> | void, timeoutMs?: number): Promise<void> {
    if (action) {
      const maybePromise = action();
      if (isPromise(maybePromise)) {
        const task = new Task<void>(timeoutMs);
        task.chainTo(maybePromise);
        return task.promise;
      }
    }
    return Promise.resolve();
  }

  private handleTimeout(): Promise<RunResult> {
    return this.dispose()
      .then(() => this.createInnerRunner())
      .then(() => this.init())
      .then(() => ({ status: RunStatus.Timeout, tests: [] }));
  }
}