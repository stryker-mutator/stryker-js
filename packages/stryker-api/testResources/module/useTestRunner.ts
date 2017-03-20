import {
  CoverageCollection, CoverageResult, CoverageCollectionPerTest, CoverageData,
  StatementMap, TestResult, TestRunner, RunnerOptions,
  RunResult, RunOptions, TestRunnerFactory,
  TestStatus, RunStatus
} from 'stryker-api/test_runner';
import { EventEmitter } from 'events';

class MyTestRunner extends EventEmitter implements TestRunner {

  run(options: RunOptions) {
    const coverage: CoverageCollection | CoverageCollectionPerTest = {
      'a/file': {
        s: {
          '23': 32
        }
      }
    };
    return new Promise<RunResult>(r => r({
      tests: [{
        status: TestStatus.Failed,
        name: '',
        failureMessages: [''],
        timeSpentMs: 23
      }],
      status: RunStatus.Complete,
      coverage
    }));
  };
}

let runnerOptions: RunnerOptions = {
  files: [{ path: 'some', mutated: true, included: false }, { path: 'files', mutated: false, included: true }],
  port: 1,
  strykerOptions: null
};

TestRunnerFactory.instance().register('MyTestRunner', MyTestRunner);
let myTestRunner = TestRunnerFactory.instance().create('MyTestRunner', runnerOptions);
if (!(myTestRunner instanceof MyTestRunner)) {
  throw Error('Something wrong with myTestRunner');
}

console.log(TestRunnerFactory.instance().knownNames());
let coverageData: CoverageData = {};
let statementMap: StatementMap = {};
statementMap['23'] = { start: { line: 23, column: 23 }, end: { line: 42, column: 42 } };
coverageData['32'] = 24;
let coverageResult: CoverageResult = {
  s: coverageData,
};
