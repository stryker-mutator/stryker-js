import { getLogger } from 'log4js';
import { EventEmitter } from 'events';
import { TestRunner, RunResult, RunStatus, RunnerOptions } from 'stryker-api/test_runner';
import { FileDescriptor } from 'stryker-api/core';
import LibWrapper from './LibWrapper';
import StrykerMochaReporter from './StrykerMochaReporter';
import MochaRunnerOptions, { mochaOptionsKey } from './MochaRunnerOptions';

export default class MochaTestRunner extends EventEmitter implements TestRunner {
  private files: FileDescriptor[];
  private log = getLogger(MochaTestRunner.name);
  private mochaRunnerOptions: MochaRunnerOptions | undefined;

  constructor(runnerOptions: RunnerOptions) {
    super();
    this.files = runnerOptions.files;
    this.mochaRunnerOptions = runnerOptions.strykerOptions[mochaOptionsKey];
    this.additionalRequires();
  }

  private purgeFiles() {
    this.files.forEach(f => delete require.cache[f.name]);
  }

  run(): Promise<RunResult> {
    return new Promise<RunResult>((resolve, reject) => {
      try {
        this.purgeFiles();
        let mocha = new LibWrapper.Mocha({ reporter: StrykerMochaReporter as any, bail: true });
        this.addFiles(mocha);
        this.configure(mocha);
        try {
          mocha.run((failures: number) => {
            const reporter = StrykerMochaReporter.CurrentInstance;
            if (reporter) {
              const result: RunResult = reporter.runResult;
              resolve(result);
            } else {
              const errorMsg = 'The StrykerMochaReporter was not instantiated properly. Could not retrieve the RunResult.';
              this.log.error(errorMsg);
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
        this.log.error(error);
        reject(error);
      }
    });
  }

  private addFiles(mocha: Mocha) {
    this.files.filter(file => file.included).forEach(f => {
      mocha.addFile(f.name);
    });
  }

  private configure(mocha: Mocha) {
    const options = this.mochaRunnerOptions;

    function setIfDefined<T>(value: T | undefined, operation: (input: T) => void) {
      if (typeof value !== 'undefined') {
        operation.apply(mocha, [value]);
      }
    }

    if (options) {
      setIfDefined(options.asyncOnly, mocha.asyncOnly);
      setIfDefined(options.timeout, mocha.timeout);
      setIfDefined(options.ui, mocha.ui);
    }
  }

  private additionalRequires() {
    if (this.mochaRunnerOptions && this.mochaRunnerOptions.require) {
      this.mochaRunnerOptions.require.forEach(LibWrapper.require);
    }
  }
}