import * as path from 'path';
import * as log4js from 'log4js';
import { EventEmitter } from 'events';
import { TestRunner, TestResult, RunResult, TestStatus, RunStatus, RunnerOptions, CoverageCollection } from 'stryker-api/test_runner';
import { InputFile } from 'stryker-api/core';


// import * as Mocha from 'mocha';
const Mocha = require('mocha');
import StrykerMochaReporter from './StrykerMochaReporter';

const log = log4js.getLogger('MochaTestRunner');
export default class MochaTestRunner extends EventEmitter implements TestRunner {
  private files: InputFile[];

  constructor(runnerOptions: RunnerOptions) {
    super();
    this.files = runnerOptions.files;
  }

  private purgeFiles() {
    this.files.forEach(f => delete require.cache[f.path]);
  }

  run(): Promise<RunResult> {
    return new Promise<RunResult>((resolve, fail) => {
      try {
        this.purgeFiles();
        let mocha = new Mocha({ reporter: StrykerMochaReporter, bail: true });
        this.files.filter(file => file.included).forEach(f => mocha.addFile(f.path));
        try {
          let runner: any = mocha.run((failures: number) => {
            let result: RunResult = runner.runResult;
            resolve(result);
          });
        } catch (error) {
          resolve({
            status: RunStatus.Error,
            tests: [],
            errorMessages: [error]
          });
        }
      } catch (error) {
        log.error(error);
        fail(error);
      }
    });

  }
}