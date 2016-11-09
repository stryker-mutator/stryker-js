import { EventEmitter } from 'events'; 
import { RunResult, RunState, RunOptions, TestRunner, TestRunnerFactory } from 'stryker-api/test_runner';

class CoverageReportingTestRunner extends EventEmitter implements TestRunner {

  runResult: RunResult = { state: RunState.Complete, tests: [], coverage: <any>'realCoverage' };

  run(options: RunOptions) {
    (Function('return this'))().__coverage__ = 'overriden';
    return Promise.resolve(this.runResult);
  }
}

TestRunnerFactory.instance().register('coverage-reporting', CoverageReportingTestRunner);