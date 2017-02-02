import { EventEmitter } from 'events'; 
import { TestRunnerFactory, RunnerOptions, TestRunner, RunOptions, RunStatus, RunResult } from 'stryker-api/test_runner';
import { isRegExp } from 'util';

class DiscoverRegexTestRunner extends EventEmitter implements TestRunner {

  constructor(private runnerOptions: RunnerOptions) {
    super();
  }

  run(options: RunOptions): Promise<RunResult> {
    if (isRegExp(this.runnerOptions.strykerOptions['someRegex'])) {
      return Promise.resolve({ status: RunStatus.Complete, tests: []});
    } else {
      return Promise.resolve({ status: RunStatus.Error, tests: [], errorMessages: ['No regex found in runnerOptions.strykerOptions.someRegex'] });
    }
  }
}

TestRunnerFactory.instance().register('discover-regex', DiscoverRegexTestRunner);