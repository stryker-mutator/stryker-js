import { getLogger } from 'stryker-api/logging';
import * as path from 'path';
import { TestRunner, RunResult, RunStatus, RunnerOptions } from 'stryker-api/test_runner';
import LibWrapper from './LibWrapper';
import StrykerMochaReporter from './StrykerMochaReporter';
import MochaRunnerOptions, { mochaOptionsKey } from './MochaRunnerOptions';
import { evalGlobal } from './utils';

const DEFAULT_TEST_PATTERN = 'test/**/*.js';

export default class MochaTestRunner implements TestRunner {

  private testFileNames: string[];
  private readonly allFileNames: string[];
  private readonly log = getLogger(MochaTestRunner.name);
  private readonly mochaRunnerOptions: MochaRunnerOptions;

  constructor(runnerOptions: RunnerOptions) {
    this.mochaRunnerOptions = runnerOptions.strykerOptions[mochaOptionsKey];
    this.allFileNames = runnerOptions.fileNames;
    this.additionalRequires();
  }

  public init(): void {
    const globPatterns = this.mochaFileGlobPatterns();
    const globPatternsAbsolute = globPatterns.map(glob => path.resolve(glob));
    this.testFileNames = LibWrapper.multimatch(this.allFileNames, globPatternsAbsolute);
    if (this.testFileNames.length) {
      this.log.debug(`Using files: ${JSON.stringify(this.testFileNames, null, 2)}`);
    } else {
      this.log.debug(`Tried ${JSON.stringify(globPatternsAbsolute, null, 2)} on files: ${JSON.stringify(this.allFileNames, null, 2)}.`);
      throw new Error(`[${MochaTestRunner.name}] No files discovered (tried pattern(s) ${JSON.stringify(globPatterns, null, 2)}). Please specify the files (glob patterns) containing your tests in ${mochaOptionsKey}.files in your stryker.conf.js file.`);
    }
  }

  private mochaFileGlobPatterns(): string[] {
    if (typeof this.mochaRunnerOptions.files === 'string') {
      return [this.mochaRunnerOptions.files];
    } else {
      return this.mochaRunnerOptions.files || [DEFAULT_TEST_PATTERN];
    }
  }

  public run({ testHooks }: { testHooks?: string }): Promise<RunResult> {
    return new Promise<RunResult>((resolve, reject) => {
      try {
        this.purgeFiles();
        const mocha = new LibWrapper.Mocha({ reporter: StrykerMochaReporter as any, bail: true });
        this.configure(mocha);
        this.addTestHooks(mocha, testHooks);
        this.addFiles(mocha);
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
                errorMessages: [errorMsg],
                status: RunStatus.Error,
                tests: []
              });
            }
          });
        } catch (error) {
          resolve({
            errorMessages: [error],
            status: RunStatus.Error,
            tests: []
          });
        }
      } catch (error) {
        this.log.error(error);
        reject(error);
      }
    });
  }

  private purgeFiles() {
    this.allFileNames.forEach(fileName => delete require.cache[fileName]);
  }

  private addFiles(mocha: Mocha) {
    this.testFileNames.forEach(fileName => {
      mocha.addFile(fileName);
    });
  }

  private addTestHooks(mocha: Mocha, testHooks: string | undefined): any {
    if (testHooks) {
      const suite = (mocha as any).suite;
      suite.emit('pre-require', global, '', mocha);
      suite.emit('require', evalGlobal(testHooks), '', mocha);
      suite.emit('post-require', global, '', mocha);
    }
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
    if (this.mochaRunnerOptions.require) {
      this.mochaRunnerOptions.require.forEach(LibWrapper.require);
    }
  }
}
