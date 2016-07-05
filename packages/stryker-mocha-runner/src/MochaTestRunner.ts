import {TestRunner, TestResult, RunResult, RunnerOptions, CoverageCollection} from 'stryker-api/test_runner';
import * as path from 'path';
import * as log4js from 'log4js';
// import * as Mocha from 'mocha';
var Mocha = require('mocha');
import StrykerMochaReporter from './StrykerMochaReporter';

const log = log4js.getLogger('MochaTestRunner');
export default class MochaTestRunner implements TestRunner {
  private files: string[];

  constructor(runnerOptions: RunnerOptions) {
    this.files = runnerOptions.files.map(f => path.resolve(f.path));
  }

  private purgeFiles() {
    this.files.forEach(f => delete require.cache[f]);
  }

  run(): Promise<RunResult> {
    return new Promise<RunResult>((resolve, fail) => {
      try {
        this.purgeFiles();
        let mocha = new Mocha({ reporter: StrykerMochaReporter });
        this.files.forEach(f => mocha.addFile(f));
        let runner: any = mocha.run((failures: number) => {
          let result: RunResult = runner.runResult;
          resolve(result);
        });
      } catch (error) {
        log.error(error);
        fail();
      }
    });

  }
}