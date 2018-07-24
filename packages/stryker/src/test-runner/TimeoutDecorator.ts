import { RunOptions, RunResult, RunStatus } from 'stryker-api/test_runner';
import TestRunnerDecorator from './TestRunnerDecorator';
import { getLogger } from 'stryker-api/logging';
import { sleep } from '../utils/objectUtils';

const TIMEOUT_EXPIRED = 'timeout_expired';

/**
 * Wraps a test runner and implements the timeout functionality.
 */
export default class TimeoutDecorator extends TestRunnerDecorator {

  private readonly log = getLogger(TimeoutDecorator.name);

  async run(options: RunOptions): Promise<RunResult> {
    this.log.debug('Starting timeout timer (%s ms) for a test run', options.timeout);
    const result = await Promise.race([super.run(options), timeout()]);
    if (result === TIMEOUT_EXPIRED) {
      return this.handleTimeout();
    } else {
      return result;
    }
    function timeout() {
      return sleep(options.timeout).then<'timeout_expired'>(() => TIMEOUT_EXPIRED);
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