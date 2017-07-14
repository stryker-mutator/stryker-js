import * as log4js from 'log4js';
import * as os from 'os';
import * as _ from 'lodash';
import { InputFile } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import { MutantResult, MutantStatus } from 'stryker-api/report';
import { TestFramework } from 'stryker-api/test_framework';
import { freezeRecursively } from './utils/objectUtils';
import CoverageInstrumenter from './coverage/CoverageInstrumenter';
import Sandbox from './Sandbox';
import Mutant from './Mutant';
import StrictReporter from './reporters/StrictReporter';

const PromisePool = require('es6-promise-pool');

const log = log4js.getLogger('SandboxCoordinator');

// The initial run might take a while.
// For example: angular-bootstrap takes up to 45 seconds.
// Lets take 5 minutes just to be sure
const INITIAL_RUN_TIMEOUT = 60 * 1000 * 5;

export default class SandboxCoordinator {

  constructor(private options: Config, private files: InputFile[], private testFramework: TestFramework | null, private reporter: StrictReporter) { }

  async initialRun(coverageInstrumenter: CoverageInstrumenter): Promise<RunResult> {
    if (this.files.length > 0) {
      log.info(`Starting initial test run. This may take a while.`);
      return this.startTestRun(coverageInstrumenter);
    } else {
      log.info(`No files have been found. Aborting initial test run.`);
      return this.createDryRunResult(); 
    }
  }

  async runMutants(mutants: Mutant[]): Promise<MutantResult[]> {
    mutants = _.clone(mutants); // work with a copy because we're changing state (pop'ing values)
    let results: MutantResult[] = [];
    let sandboxes = await this.createSandboxes();
    let promiseProducer: () => Promise<any> | null = () => {
      const mutant = mutants.shift();
      if (!mutant) {
        return null; // we're done
      } else {
        if (mutant.scopedTestIds.length > 0) {
          const sandbox = sandboxes.shift();
          if (sandbox) {
            return sandbox.runMutant(mutant)
              .then((runResult) => {
                this.reportMutantTested(mutant, runResult, results);
                sandboxes.push(sandbox); // mark the sandbox as available again
            });
          }
          else {
            return null;
          }
        } else {
          this.reportMutantTested(mutant, null, results);
          return Promise.resolve();
        }
      }
    };
    await new PromisePool(promiseProducer, sandboxes.length).start();
    await this.reportAllMutantsTested(results);
    await Promise.all(sandboxes.map(sandbox => sandbox.dispose()));
    return results;
  }

  private async createSandboxes(): Promise<Sandbox[]> {
    let numConcurrentRunners = os.cpus().length;
    let numConcurrentRunnersSource = 'CPU count';
    if (numConcurrentRunners > this.options.maxConcurrentTestRunners && this.options.maxConcurrentTestRunners > 0) {
      numConcurrentRunners = this.options.maxConcurrentTestRunners;
      numConcurrentRunnersSource = 'maxConcurrentTestRunners config';
    }
    const sandboxes: Sandbox[] = [];
    for (let i = 0; i < numConcurrentRunners; i++) {
      sandboxes.push(new Sandbox(this.options, i, this.files, this.testFramework, null));
    }
    log.info(`Creating ${numConcurrentRunners} test runners (based on ${numConcurrentRunnersSource})`);
    await Promise.all(sandboxes.map(s => s.initialize()));
    return sandboxes;
  }

  private async startTestRun(coverageInstrumenter: CoverageInstrumenter): Promise<RunResult> {
      const sandbox = new Sandbox(this.options, 0, this.files, this.testFramework, coverageInstrumenter);
      await sandbox.initialize();
      let runResult = await sandbox.run(INITIAL_RUN_TIMEOUT);
      await sandbox.dispose();

      return runResult;
  }

  private createDryRunResult(): RunResult {
    return {
        status: RunStatus.Complete,
        tests: [],
        errorMessages: []
      };
  }

  private reportMutantTested(mutant: Mutant, runResult: RunResult | null, results: MutantResult[]) {
    let result = this.collectFrozenMutantResult(mutant, runResult);
    results.push(result);
    this.reporter.onMutantTested(result);
  }

  private collectFrozenMutantResult(mutant: Mutant, runResult: RunResult | null): MutantResult {
    let status: MutantStatus = MutantStatus.NoCoverage;
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
