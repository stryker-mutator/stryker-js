import * as fs from 'fs';
import { TestRunner, RunResult, TestResult, RunStatus } from 'stryker-api/test_runner';
import { StrykerOptions } from 'stryker-api/core';
import Jasmine = require('jasmine');
import { jasmineTestResultToStrykerTestResult } from './helpers';

export default class JasmineTestRunner implements TestRunner {

  private jasmineConfigFile: string | undefined;
  private fileNames: string[];
  private Date: { new(): Date };

  constructor({ fileNames, strykerOptions: { jasmineConfigFile } }: { fileNames: string[], strykerOptions: StrykerOptions }) {
    this.Date = Date;
    this.jasmineConfigFile = jasmineConfigFile;
    this.fileNames = fileNames;
  }

  run(options: {}): Promise<RunResult> {
    this.clearRequireCache();
    const tests: TestResult[] = [];
    const jasmine = new Jasmine({ projectBaseDir: process.cwd() });
    let startTimeCurrentSpec = 0;
    if (!this.jasmineConfigFile && fs.existsSync('spec/support/jasmine.json')) {
      this.jasmineConfigFile = 'spec/support/jasmine.json';
    }
    if (this.jasmineConfigFile) {
      jasmine.loadConfigFile(this.jasmineConfigFile);
    }
    jasmine.stopSpecOnExpectationFailure(true);
    jasmine.env.throwOnExpectationFailure(true);
    jasmine.exit = () => { };
    jasmine.clearReporters();
    const self = this;
    return new Promise<RunResult>(resolve => {
      const reporter: jasmine.CustomReporter = {
        specStarted() {
          startTimeCurrentSpec = new self.Date().getTime();
        },

        specDone(result: jasmine.CustomReporterResult) {
          tests.push(jasmineTestResultToStrykerTestResult(result, new self.Date().getTime() - startTimeCurrentSpec));
        },

        jasmineDone(runDetails: jasmine.RunDetails) {
          resolve({
            errorMessages: [],
            status: RunStatus.Complete,
            tests
          });
        }
      };
      jasmine.addReporter(reporter);
      jasmine.execute();
    });
  }

  clearRequireCache() {
    this.fileNames.forEach(fileName => {
      delete require.cache[require.resolve(fileName)];
    });
  }
}