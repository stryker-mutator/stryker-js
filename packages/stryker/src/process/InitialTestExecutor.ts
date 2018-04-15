import { EOL } from 'os';
import { RunStatus, RunResult, TestResult, TestStatus } from 'stryker-api/test_runner';
import { TestFramework } from 'stryker-api/test_framework';
import { Config } from 'stryker-api/config';
import { TranspilerOptions, Transpiler } from 'stryker-api/transpile';
import { File } from 'stryker-api/core';
import TranspilerFacade from '../transpiler/TranspilerFacade';
import { getLogger } from 'log4js';
import Sandbox from '../Sandbox';
import Timer from '../utils/Timer';
import CoverageInstrumenterTranspiler, { CoverageMapsByFile } from '../transpiler/CoverageInstrumenterTranspiler';
import InputFileCollection from '../input/InputFileCollection';
import SourceMapper from '../transpiler/SourceMapper';
import { coveragePerTestHooks } from '../transpiler/coverageHooks';

// The initial run might take a while.
// For example: angular-bootstrap takes up to 45 seconds.
// Lets take 5 minutes just to be sure
const INITIAL_RUN_TIMEOUT = 60 * 1000 * 5;

export interface InitialTestRunResult {
  runResult: RunResult;
  sourceMapper: SourceMapper;
  coverageMaps: CoverageMapsByFile;
}

export default class InitialTestExecutor {

  private readonly log = getLogger(InitialTestExecutor.name);

  constructor(private options: Config, private inputFiles: InputFileCollection, private testFramework: TestFramework | null, private timer: Timer) {
  }

  async run(): Promise<InitialTestRunResult> {

    this.log.info(`Starting initial test run. This may take a while.`);

    // Before we can run the tests we transpile the input files. 
    // Files that are not transpiled should pass through without transpiling
    const transpiledFiles = await this.transpileInputFiles();

    // Now that we have the transpiled files, we create a source mapper so 
    // we can figure out which files we need to annotate for code coverage
    const sourceMapper = SourceMapper.create(transpiledFiles, this.options);

    // Annotate the transpiled files for code coverage. This allows the 
    // test runner to report code coverage (if `coverageAnalysis` is enabled)
    const { coverageMaps, instrumentedFiles } = await this.annotateForCodeCoverage(transpiledFiles, sourceMapper);
    this.logTranspileResult(instrumentedFiles);

    const runResult = await this.runInSandbox(instrumentedFiles);
    this.validateResult(runResult);
    return {
      sourceMapper,
      runResult,
      coverageMaps
    };
  }

  private async runInSandbox(files: ReadonlyArray<File>): Promise<RunResult> {
    const sandbox = await Sandbox.create(this.options, 0, files, this.testFramework);
    const runResult = await sandbox.run(INITIAL_RUN_TIMEOUT, this.getCollectCoverageHooksIfNeeded());
    await sandbox.dispose();
    return runResult;
  }

  private async transpileInputFiles(): Promise<ReadonlyArray<File>> {
    const transpilerFacade = this.createTranspilerFacade();
    return await transpilerFacade.transpile(this.inputFiles.files);
  }

  private async annotateForCodeCoverage(files: ReadonlyArray<File>, sourceMapper: SourceMapper)
    : Promise<{ instrumentedFiles: ReadonlyArray<File>, coverageMaps: CoverageMapsByFile }> {
    const filesToInstrument = this.inputFiles.filesToMutate.map(mutateFile => sourceMapper.transpiledFileNameFor(mutateFile.name));
    const coverageInstrumenterTranspiler = new CoverageInstrumenterTranspiler(this.options, filesToInstrument);
    const instrumentedFiles = await coverageInstrumenterTranspiler.transpile(files);
    return { coverageMaps: coverageInstrumenterTranspiler.fileCoverageMaps, instrumentedFiles };
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

  /**
   * Creates a facade for the transpile pipeline.
   * Also includes the coverage instrumenter transpiler,
   * which is used to instrument for code coverage when needed.
   */
  private createTranspilerFacade(): Transpiler {
    // Let the transpiler produce source maps only if coverage analysis is enabled
    const transpilerSettings: TranspilerOptions = {
      config: this.options,
      produceSourceMaps: this.options.coverageAnalysis !== 'off'
    };
    return new TranspilerFacade(transpilerSettings);
  }

  private getCollectCoverageHooksIfNeeded(): string | undefined {
    if (this.options.coverageAnalysis === 'perTest') {
      if (this.testFramework) {
        // Add piece of javascript to collect coverage per test results
        this.log.debug(`Adding test hooks for coverageAnalysis "perTest".`);
        return coveragePerTestHooks(this.testFramework);
      } else {
        this.log.warn('Cannot measure coverage results per test, there is no testFramework and thus no way of executing code right before and after each test.');
      }
    }
    return undefined;
  }

  private logTranspileResult(transpiledFiles: ReadonlyArray<File>) {
    if (this.options.transpilers.length && this.log.isDebugEnabled()) {
      this.log.debug(`Transpiled files: ${JSON.stringify(transpiledFiles.map(f => `${f.name}`), null, 2)}`);
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
