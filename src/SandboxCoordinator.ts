import * as log4js from 'log4js';
import * as os from 'os';
import * as _ from 'lodash';
import { StrykerOptions, InputFile } from 'stryker-api/core';
import { TestRunner, RunResult, RunnerOptions, TestResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import { Reporter, MutantResult, MutantStatus } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';
import { freezeRecursively } from './utils/objectUtils';
import CoverageInstrumenter from './coverage/CoverageInstrumenter';
import Sandbox from './Sandbox';
import Mutant from './Mutant';
const PromisePool = require('es6-promise-pool');

const log = log4js.getLogger('SandboxCoordinator');

// The initial run might take a while.
// For example: angular-bootstrap takes up to 45 seconds.
// Lets take 5 minutes just to be sure 
const INITIAL_RUN_TIMEOUT = 60 * 1000 * 5;

export default class SandboxCoordinator {

  constructor(private options: StrykerOptions, private files: InputFile[], private testFramework: TestFramework, private reporter: Reporter) { }

  initialRun(coverageInstrumenter: CoverageInstrumenter): Promise<RunResult> {
    log.info(`Starting initial test run. This may take a while.`);
    const sandbox = new Sandbox(this.options, 0, this.files, this.testFramework, coverageInstrumenter);
    return sandbox
      .initialize()
      .then(() => sandbox.run(INITIAL_RUN_TIMEOUT))
      .then((runResult) => sandbox.dispose().then(() => runResult));
  }

  runMutants(mutants: Mutant[]): Promise<MutantResult[]> {
    mutants = _.clone(mutants); // work with a copy because we're changing state (pop'ing values)
    let results: MutantResult[] = [];
    return this.createSandboxes().then(sandboxes => {
      let promiseProducer: () => Promise<number> | Promise<void> = () => {
        if (mutants.length === 0) {
          return null; // we're done
        } else {
          const mutant = mutants.shift();
          if (mutant.scopedTestIds.length > 0) {
            let sandbox = sandboxes.shift();
            return sandbox.runMutant(mutant)
              .then((runResult) => this.reportMutantTested(mutant, runResult, results))
              .then(() => sandboxes.push(sandbox)); // mark the sandbox as available again
          } else {
            this.reportMutantTested(mutant, null, results);
            return Promise.resolve();
          }
        }
      };
      return new PromisePool(promiseProducer, sandboxes.length)
        .start()
        .then(() => this.reportAllMutantsTested(results))
        .then(() => Promise.all(sandboxes.map(sandbox => sandbox.dispose())))
        .then(() => results);
    });
  }

  private createSandboxes(): Promise<Sandbox[]> {
    const cpuCount = os.cpus().length;
    const sandboxes: Sandbox[] = [];
    for (let i = 0; i < cpuCount; i++) {
      sandboxes.push(new Sandbox(this.options, i, this.files, this.testFramework, null));
    }
    log.info(`Creating ${cpuCount} test runners (based on cpu count)`);
    return Promise.all(sandboxes.map(s => s.initialize()))
      .then(() => sandboxes);
  }

  private reportMutantTested(mutant: Mutant, runResult: RunResult, results: MutantResult[]) {
    let result = this.collectFrozenMutantResult(mutant, runResult);
    results.push(result);
    this.reporter.onMutantTested(result);
  }

  private collectFrozenMutantResult(mutant: Mutant, runResult?: RunResult): MutantResult {
    let status: MutantStatus;
    let testNames: string[];
    if (runResult) {
      switch (runResult.status) {
        case RunStatus.Timeout:
          status = MutantStatus.TimedOut;
          break;
        case RunStatus.Error:
          status = MutantStatus.Error;
          break;
        case RunStatus.Complete:
          if (runResult.tests.some(t => t.status === TestStatus.Failed)) {
            status = MutantStatus.Killed;
          } else {
            status = MutantStatus.Survived;
          }
          break;
      }
      testNames = runResult.tests
        .filter(t => t.status !== TestStatus.Skipped)
        .map(t => t.name);
    } else {
      testNames = [];
      status = MutantStatus.NoCoverage;
    }

    let result: MutantResult = {
      sourceFilePath: mutant.filename,
      mutatorName: mutant.mutatorName,
      status: status,
      replacement: mutant.replacement,
      location: mutant.location,
      range: mutant.range,
      testsRan: testNames,
      originalLines: mutant.originalLines,
      mutatedLines: mutant.mutatedLines,
    };
    freezeRecursively(result);
    return result;
  }

  private reportAllMutantsTested(results: MutantResult[]) {
    freezeRecursively(results);
    this.reporter.onAllMutantsTested(results);
  }

}