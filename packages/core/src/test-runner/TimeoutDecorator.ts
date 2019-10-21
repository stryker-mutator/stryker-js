import { RunOptions, RunResult, RunStatus } from '@stryker-mutator/api/test_runner';
import { getLogger } from 'log4js';
import { timeout, TimeoutExpired } from '../utils/objectUtils';
import TestRunnerDecorator from './TestRunnerDecorator';

/**
 * Wraps a test runner and implements the timeout functionality.
 */
export default class TimeoutDecorator extends TestRunnerDecorator {
  private readonly log = getLogger(TimeoutDecorator.name);

  public async run(options: RunOptions): Promise<RunResult> {
    this.log.debug('Starting timeout timer (%s ms) for a test run', options.timeout);
    const result = await timeout(super.run(options), options.timeout);
    if (result === TimeoutExpired) {
      return this.handleTimeout();
    } else {
      return result;
    }
  }

  private handleTimeout(): Promise<RunResult> {
    this.log.debug('Timeout expired, restarting the process and reporting timeout');
    return this.dispose()
      .then(() => this.createInnerRunner())
      .then(() => this.init())
      .then(() => ({ status: RunStatus.Timeout, tests: [] }));
  }
}
