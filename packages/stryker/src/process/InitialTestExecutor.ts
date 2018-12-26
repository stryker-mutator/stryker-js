import { EOL } from 'os';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';
import { TestFramework } from 'stryker-api/test_framework';
import { RunResult, RunStatus, TestResult, TestStatus } from 'stryker-api/test_runner';
import { Transpiler, TranspilerOptions } from 'stryker-api/transpile';
import InputFileCollection from '../input/InputFileCollection';
import LoggingClientContext from '../logging/LoggingClientContext';
import Sandbox from '../Sandbox';
import { coveragePerTestHooks } from '../transpiler/coverageHooks';
import CoverageInstrumenterTranspiler, { CoverageMapsByFile } from '../transpiler/CoverageInstrumenterTranspiler';
import SourceMapper from '../transpiler/SourceMapper';
import TranspilerFacade from '../transpiler/TranspilerFacade';
import Timer from '../utils/Timer';

// The initial run might take a while.
// For example: angular-bootstrap takes up to 45 seconds.
// Lets take 5 minutes just to be sure
const INITIAL_RUN_TIMEOUT = 60 * 1000 * 5;
const INITIAL_TEST_RUN_MARKER = 'Initial test run';

export interface InitialTestRunResult {
  coverageMaps: CoverageMapsByFile;
  overheadTimeMS: number;
  runResult: RunResult;
  sourceMapper: SourceMapper;
}

/**
 * A small object that keeps the timing variables of a test run.
 */
interface Timing {
  /**
   * The time that the test runner was actually executing tests in milliseconds.
   */
  net: number;
  /**
   * the time that was spend not executing tests in milliseconds.
   * So the time it took to start the test runner and to report the result.
   */
  overhead: number;
}

export default class InitialTestExecutor {

  private readonly log = getLogger(InitialTestExecutor.name);

  constructor(private readonly options: Config, private readonly inputFiles: InputFileCollection, private readonly testFramework: TestFramework | null, private readonly timer: Timer, private readonly loggingContext: LoggingClientContext) { }

  public async run(): Promise<InitialTestRunResult> {

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

    const { runResult, grossTimeMS } = await this.runInSandbox(instrumentedFiles);
    const timing = this.calculateTiming(grossTimeMS, runResult.tests);
    this.validateResult(runResult, timing);

    return {
      coverageMaps,
      overheadTimeMS: timing.overhead,
      runResult,
      sourceMapper
    };
  }

  private async annotateForCodeCoverage(files: ReadonlyArray<File>, sourceMapper: SourceMapper)
    : Promise<{ coverageMaps: CoverageMapsByFile; instrumentedFiles: ReadonlyArray<File> }> {
    const filesToInstrument = this.inputFiles.filesToMutate.map(mutateFile => sourceMapper.transpiledFileNameFor(mutateFile.name));
    const coverageInstrumenterTranspiler = new CoverageInstrumenterTranspiler(this.options, filesToInstrument);
    const instrumentedFiles = await coverageInstrumenterTranspiler.transpile(files);

    return { coverageMaps: coverageInstrumenterTranspiler.fileCoverageMaps, instrumentedFiles };
  }

  /**
   * Calculates the timing variables for the test run.
   * grossTime = NetTime + overheadTime
   *
   * The overhead time is used to calculate exact timeout values during mutation testing.
   * See timeoutMS setting in README for more information on this calculation
   */
  private calculateTiming(grossTimeMS: number, tests: ReadonlyArray<TestResult>): Timing {
    const netTimeMS = tests.reduce((total, test) => total + test.timeSpentMs, 0);
    const overheadTimeMS = grossTimeMS - netTimeMS;

    return {
      net: netTimeMS,
      overhead: overheadTimeMS < 0 ? 0 : overheadTimeMS
    };
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

  private filterOutFailedTests(runResult: RunResult) {
    return runResult.tests.filter(testResult => testResult.status === TestStatus.Failed);
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
  private logErrorsInInitialRun(runResult: RunResult) {
    let message = 'One or more tests resulted in an error:';
    if (runResult.errorMessages && runResult.errorMessages.length) {
      runResult.errorMessages.forEach(error => message += `${EOL}\t${error}`);
    }
    this.log.error(message);
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

  private logInitialTestRunSucceeded(tests: TestResult[], timing: Timing) {
    this.log.info('Initial test run succeeded. Ran %s tests in %s (net %s ms, overhead %s ms).',
      tests.length, this.timer.humanReadableElapsed(), timing.net, timing.overhead);
  }

  private logTimeoutInitialRun(runResult: RunResult) {
    let message = 'Initial test run timed out! Ran following tests before timeout:';
    runResult.tests.forEach(test => message += `${EOL}\t${test.name} (${TestStatus[test.status]})`);
    this.log.error(message);
  }

  private logTranspileResult(transpiledFiles: ReadonlyArray<File>) {
    if (this.options.transpilers.length && this.log.isDebugEnabled()) {
      this.log.debug(`Transpiled files: ${JSON.stringify(transpiledFiles.map(f => `${f.name}`), null, 2)}`);
    }
  }

  private async runInSandbox(files: ReadonlyArray<File>): Promise<{ grossTimeMS: number; runResult: RunResult }> {
    const sandbox = await Sandbox.create(this.options, 0, files, this.testFramework, 0, this.loggingContext);
    this.timer.mark(INITIAL_TEST_RUN_MARKER);
    const runResult = await sandbox.run(INITIAL_RUN_TIMEOUT, this.getCollectCoverageHooksIfNeeded());
    const grossTimeMS = this.timer.elapsedMs(INITIAL_TEST_RUN_MARKER);
    await sandbox.dispose();

    return { runResult, grossTimeMS };
  }

  private async transpileInputFiles(): Promise<ReadonlyArray<File>> {
    const transpilerFacade = this.createTranspilerFacade();

    return transpilerFacade.transpile(this.inputFiles.files);
  }

  private validateResult(runResult: RunResult, timing: Timing): void {
    switch (runResult.status) {
      case RunStatus.Complete:
        const failedTests = this.filterOutFailedTests(runResult);
        if (failedTests.length) {
          this.logFailedTestsInInitialRun(failedTests);
          throw new Error('There were failed tests in the initial test run.');
        }
        if (runResult.tests.length === 0) {
          this.log.warn('No tests were executed. Stryker will exit prematurely. Please check your configuration.');

          return;
        } else {
          this.logInitialTestRunSucceeded(runResult.tests, timing);

          return;
        }
      case RunStatus.Error:
        this.logErrorsInInitialRun(runResult);
        break;
      case RunStatus.Timeout:
        this.logTimeoutInitialRun(runResult);
    }
    throw new Error('Something went wrong in the initial test run');
  }
}
