import { EventEmitter } from 'events'; 
import { TestRunnerFactory, RunnerOptions, TestRunner, RunOptions, RunState, RunResult, TestResult } from 'stryker-api/test_runner';
import { isRegExp } from 'util';

class DiscoverRegexTestRunner extends EventEmitter implements TestRunner {

  constructor(private runnerOptions: RunnerOptions) {
    super();
  }

  run(options: RunOptions): Promise<RunResult> {
    if (isRegExp(this.runnerOptions.strykerOptions['someRegex'])) {
      return Promise.resolve({ state: RunState.Complete, tests: []});
    } else {
      return Promise.resolve({ state: RunState.Error, tests: [], errorMessages: ['No regex found in runnerOptions.strykerOptions.someRegex'] });
    }
  }
}

TestRunnerFactory.instance().register('discover-regex', DiscoverRegexTestRunner);