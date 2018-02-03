import { EOL } from 'os';
import { RunStatus, RunResult, TestResult, TestStatus } from 'stryker-api/test_runner';
import { TestFramework } from 'stryker-api/test_framework';
import { Config } from 'stryker-api/config';
import { TranspileResult, TranspilerOptions, Transpiler } from 'stryker-api/transpile';
import { File } from 'stryker-api/core';
import TranspilerFacade from '../transpiler/TranspilerFacade';
import { getLogger } from 'log4js';
import Sandbox from '../Sandbox';
import Timer from '../utils/Timer';
import CoverageInstrumenterTranspiler, { CoverageMapsByFile } from '../transpiler/CoverageInstrumenterTranspiler';

// The initial run might take a while.
// For example: angular-bootstrap takes up to 45 seconds.
// Lets take 5 minutes just to be sure
const INITIAL_RUN_TIMEOUT = 60 * 1000 * 5;

export interface InitialTestRunResult {
  runResult: RunResult;
  transpiledFiles: File[];
  coverageMaps: CoverageMapsByFile;
}

export default class InitialTestExecutor {

  private readonly log = getLogger(InitialTestExecutor.name);

  constructor(private options: Config, private files: File[], private testFramework: TestFramework | null, private timer: Timer) {
  }

  async run(): Promise<InitialTestRunResult> {
    if (this.files.length > 0) {
      this.log.info(`Starting initial test run. This may take a while.`);
      const result = await this.initialRunInSandbox();
      this.validateResult(result.runResult);
      return result;
    } else {
      this.log.info(`No files have been found. Aborting initial test run.`);
      return this.createDryRunResult();
    }
  }

  private async initialRunInSandbox(): Promise<InitialTestRunResult> {
    const coverageInstrumenterTranspiler = this.createCoverageInstrumenterTranspiler();
    const transpilerFacade = this.createTranspilerFacade(coverageInstrumenterTranspiler);
    const transpileResult = await transpilerFacade.transpile(this.files);
    if (transpileResult.error) {
      throw new Error(`Could not transpile input files: ${transpileResult.error}`);
    } else {
      this.logTranspileResult(transpileResult);
      const sandbox = await Sandbox.create(this.options, 0, transpileResult.outputFiles, this.testFramework);
      const runResult = await sandbox.run(INITIAL_RUN_TIMEOUT);
      await sandbox.dispose();
      return {
        runResult,
        transpiledFiles: transpileResult.outputFiles,
        coverageMaps: coverageInstrumenterTranspiler.fileCoverageMaps
      };
    }
  }

  private validateResult(runResult: RunResult): void {
    switch (runResult.status) {
      case RunStatus.Complete:
        let failedTests = this.filterOutFailedTests(runResult);
        if (failedTests.length) {
          this.logFailedTestsInInitialRun(failedTests);
          throw new Error('There were failed tests in the initial test run.');
        } if (runResult.tests.length === 0) {
          this.log.warn('No tests were executed. Stryker will exit prematurely. Please check your configuration.');
          return;
        } else {
          this.logInitialTestRunSucceeded(runResult.tests);
          return;
        }
      case RunStatus.Error:
        this.logErrorsInInitialRun(runResult);
        break;
      case RunStatus.Timeout:
        this.logTimeoutInitialRun(runResult);
        break;
    }
    throw new Error('Something went wrong in the initial test run');
  }

  private createDryRunResult(): InitialTestRunResult {
    return {
      runResult: {
        status: RunStatus.Complete,
        tests: [],
        errorMessages: []
      },
      transpiledFiles: [],
      coverageMaps: Object.create(null)
    };
  }

  /**
   * Creates a facade for the transpile pipeline.
   * Also includes the coverage instrumenter transpiler,
   * which is used to instrument for code coverage when needed.
   */
  private createTranspilerFacade(coverageInstrumenterTranspiler: CoverageInstrumenterTranspiler): Transpiler {
    // Let the transpiler produce source maps only if coverage analysis is enabled
    const transpilerSettings: TranspilerOptions = {
      config: this.options,
      produceSourceMaps: this.options.coverageAnalysis !== 'off'
    };
    return new TranspilerFacade(transpilerSettings, {
      name: CoverageInstrumenterTranspiler.name,
      transpiler: coverageInstrumenterTranspiler
    });
  }

  private createCoverageInstrumenterTranspiler() {
    return new CoverageInstrumenterTranspiler({ produceSourceMaps: true, config: this.options }, this.testFramework);
  }

  private logTranspileResult(transpileResult: TranspileResult) {
    if (this.options.transpilers.length && this.log.isDebugEnabled()) {
      this.log.debug(`Transpiled files in order:${EOL}${transpileResult.outputFiles.map(f => `${f.name} (included: ${f.included})`).join(EOL)}`);
    }
  }

  private filterOutFailedTests(runResult: RunResult) {
    return runResult.tests.filter(testResult => testResult.status === TestStatus.Failed);
  }

  private logInitialTestRunSucceeded(tests: TestResult[]) {
    this.log.info('Initial test run succeeded. Ran %s tests in %s.', tests.length, this.timer.humanReadableElapsed());
  }

  private logFailedTestsInInitialRun(failedTests: TestResult[]): void {
    let message = 'One or more tests failed in the initial test run:';
    failedTests.forEach(test => {
      message += `${EOL}\t${test.name}`;
      if (test.failureMessages && test.failureMessages.length) {
        message += `${EOL}\t\t${test.failureMessages.join(`${EOL}\t\t`)}`;
      }
    });
    this.log.error(message);
  }
  private logErrorsInInitialRun(runResult: RunResult) {
    let message = 'One or more tests resulted in an error:';
    if (runResult.errorMessages && runResult.errorMessages.length) {
      runResult.errorMessages.forEach(error => message += `${EOL}\t${error}`);
    }
    this.log.error(message);
  }

  private logTimeoutInitialRun(runResult: RunResult) {
    let message = 'Initial test run timed out! Ran following tests before timeout:';
    runResult.tests.forEach(test => message += `${EOL}\t${test.name} (${TestStatus[test.status]})`);
    this.log.error(message);
  }
}