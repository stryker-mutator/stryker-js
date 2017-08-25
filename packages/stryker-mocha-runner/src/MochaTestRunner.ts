import * as log4js from 'log4js';
import { EventEmitter } from 'events';
import { TestRunner, RunResult, RunStatus, RunnerOptions } from 'stryker-api/test_runner';
import { InputFile } from 'stryker-api/core';
import * as Mocha from 'mocha';
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
        let mocha = new Mocha({ reporter: StrykerMochaReporter as any, bail: true });
        this.files.filter(file => file.included).forEach(f => mocha.addFile(f.path));
        try {
          mocha.run((failures: number) => {
            const reporter = StrykerMochaReporter.CurrentInstance;
            if (reporter) {
              let result: RunResult = reporter.runResult;
              resolve(result);
            } else {
              const errorMsg = 'The StrykerMochaReporter was not instantiated properly. Could not retrieve the RunResult.';
              log.error(errorMsg);
              resolve({
                tests: [],
                errorMessages: [errorMsg],
                status: RunStatus.Error
              });
            }
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