import { RunOptions, RunResult, RunStatus } from '@stryker-mutator/api/test_runner';
import TestRunnerDecorator from './TestRunnerDecorator';
import { getLogger } from 'log4js';
import { TIMEOUT_EXPIRED, timeout } from '../utils/objectUtils';

/**
 * Wraps a test runner and implements the timeout functionality.
 */
export default class TimeoutDecorator extends TestRunnerDecorator {

  private readonly log = getLogger(TimeoutDecorator.name);

  public async run(options: RunOptions): Promise<RunResult> {
    this.log.debug('Starting timeout timer (%s ms) for a test run', options.timeout);
    const result = await timeout(super.run(options), options.timeout);
    if (result === TIMEOUT_EXPIRED) {
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
