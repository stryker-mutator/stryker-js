import {TestRunner, TestResult, RunResult, RunnerOptions, CoverageCollection} from 'stryker-api/test_runner';
import * as path from 'path';
import * as log4js from 'log4js';
// import * as Mocha from 'mocha';
var Mocha = require('mocha');
import StrykerMochaReporter from './StrykerMochaReporter';

const log = log4js.getLogger('MochaTestRunner');
export default class MochaTestRunner implements TestRunner {
  private mocha: Mocha;

  constructor(runnerOptions: RunnerOptions) {
    this.mocha = new Mocha({ reporter: StrykerMochaReporter });

    runnerOptions.files.forEach((file) => {
      this.mocha.addFile(file.path);
    });
  }

  run(): Promise<RunResult> {
    return new Promise<RunResult>((resolve, fail) => {
      try {
        let runner: any = this.mocha.run((failures: number) => {
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