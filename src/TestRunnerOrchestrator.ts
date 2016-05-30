import {StrykerOptions, InputFile} from './api/core';
import {RunResult, RunnerOptions, TestResult} from './api/test_runner';
import {TestSelector, TestSelectorFactory} from './api/test_selector';
import {StrykerTempFolder} from './api/util';
import IsolatedTestRunnerAdapter from './isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedTestRunnerAdapterFactory from './isolated-runner/IsolatedTestRunnerAdapterFactory';
import * as path from 'path';
import * as os from 'os';
import * as _ from 'lodash';
import Mutant from './Mutant';
import {Reporter, MutantStatus, MutantResult} from './api/report';
import * as log4js from 'log4js';
import {freezeRecursively} from './utils/objectUtils';
const PromisePool = require('es6-promise-pool')

const log = log4js.getLogger('TestRunnerOrchestrator');

interface FileMap {
  [sourceFile: string]: string
}

interface TestRunnerSandbox {
  index: number;
  runnerAdapter: IsolatedTestRunnerAdapter;
  selector: TestSelector;
  sourceFileMap: FileMap;
}

export default class TestRunnerOrchestrator {

  constructor(private options: StrykerOptions, private files: InputFile[], private reporter: Reporter) {
  }

  recordCoverage(): Promise<RunResult[]> {
    let testSelector = TestSelectorFactory.instance().create(this.options.testFramework, { options: this.options });
    let testRunner = IsolatedTestRunnerAdapterFactory.create(this.createTestRunSettings(this.files, testSelector, 0, true));
    return this.runSingleTestsRecursive(testSelector, testRunner, [], 0).then((testResults) => {
      testRunner.dispose();
      return testResults;
    });
  }

  runMutations(mutants: Mutant[]): Promise<MutantResult[]> {
    mutants = _.clone(mutants); // work with a copy because we're changing state (pop'ing values)
    let results: MutantResult[] = [];
    return this.createTestRunnerSandboxes().then(testRunners => {
      let promiseProducer: () => Promise<number> | Promise<void> = () => {
        if (mutants.length === 0) {
          return null; // we're done
        } else {
          var mutant = mutants.pop();
          if (mutant.scopedTestIds.length > 0) {
            let nextRunner = testRunners.pop();
            let sourceFileCopy = nextRunner.sourceFileMap[mutant.fileName];
            return Promise.all([mutant.save(sourceFileCopy), nextRunner.selector.select(mutant.scopedTestIds)])
              .then(() => nextRunner.runnerAdapter.run({ timeout: this.calculateTimeout(mutant.timeSpentScopedTests) }))
              .then((runResult) => {
                let result = this.collectFrozenMutantResult(mutant, runResult);
                results.push(result);
                this.reporter.onMutantTested(result);
                return mutant.reset(sourceFileCopy);
              })
              .then(() => testRunners.push(nextRunner)); // mark the runner as available again
          } else {
            let result = this.collectFrozenMutantResult(mutant);
            results.push(result);
            return Promise.resolve(this.reporter.onMutantTested(result));
          }
        }
      }
      return new PromisePool(promiseProducer, testRunners.length)
        .start()
        .then(() => testRunners.forEach(testRunner => testRunner.runnerAdapter.dispose()))
        .then(() => this.reportAllMutantsTested(results))
        .then(() => results);
    });
  }

  private reportAllMutantsTested(results: MutantResult[]) {
    freezeRecursively(results);
    this.reporter.onAllMutantsTested(results);
  }

  private calculateTimeout(baseTimeout: number) {
    return (this.options.timeoutFactor * baseTimeout) + this.options.timeoutMs;
  }

  private collectFrozenMutantResult(mutant: Mutant, runResult?: RunResult): MutantResult {
    let status: MutantStatus;
    let specsRan: string[];
    if (runResult) {
      switch (runResult.result) {
        case TestResult.Timeout:
          status = MutantStatus.TIMEDOUT;
          break;
        case TestResult.Complete:
          if (runResult.failed > 0) {
            status = MutantStatus.KILLED;
          } else {
            status = MutantStatus.SURVIVED;
          }
          break;
      }
      specsRan = runResult.specNames;
    } else {
      specsRan = [];
      status = MutantStatus.UNTESTED;
    }

    let result: MutantResult = {
      sourceFilePath: mutant.fileName,
      mutatorName: mutant.mutatorName,
      status: status,
      replacement: mutant.replacement,
      location: mutant.location,
      specsRan: specsRan,
      originalLines: mutant.originalLines,
      mutatedLines: mutant.mutatedLines
    };
    freezeRecursively(result);
    return result;
  }

  private runSingleTestsRecursive(testSelector: TestSelector, testRunner: IsolatedTestRunnerAdapter, runResults: RunResult[], currentTestIndex: number)
    : Promise<RunResult[]> {
    return new Promise<RunResult[]>(resolve => {
      testSelector.select([currentTestIndex])
        .then(() => testRunner.run({ timeout: 10000 }))
        .then(runResult => {
          if (runResult.result === TestResult.Complete && runResult.succeeded > 0 || runResult.failed > 0) {
            runResults[currentTestIndex] = runResult;
            resolve(this.runSingleTestsRecursive(testSelector, testRunner, runResults, currentTestIndex + 1));
          } else {
            if (runResult.result !== TestResult.Complete) {
              // If this was iteration n+1 (n = number of tests), the runResult.result will be Complete, so we don't record it
              runResults[currentTestIndex] = runResult;
            }
            testRunner.dispose();
            resolve(runResults);
          }
        });
    })
  }

  private createTestRunnerSandboxes(): Promise<TestRunnerSandbox[]> {

    return new Promise<TestRunnerSandbox[]>((resolve, reject) => {
      let cpuCount = os.cpus().length;
      let testRunnerSandboxes: TestRunnerSandbox[] = [];
      let allPromises: Promise<any>[] = [];
      log.info(`Creating ${cpuCount} test runners (based on cpu count)`);
      for (let i = 0; i < cpuCount; i++) {
        allPromises.push(this.createSandbox(i).then(sandbox => testRunnerSandboxes.push(sandbox)));
      }
      Promise.all(allPromises).then(() => resolve(testRunnerSandboxes));
    });
  }

  private createSandbox(index: number): Promise<TestRunnerSandbox> {
    return this.copyAllSourceFilesToTempFolder().then(sourceFileMap => {
      let selector = TestSelectorFactory.instance().create(this.options.testFramework, { options: this.options });
      let runnerFiles: InputFile[] = [];
      this.files.forEach(originalFile => {
        if (Object.keys(sourceFileMap).indexOf(originalFile.path) >= 0) {
          runnerFiles.push({ path: sourceFileMap[originalFile.path], shouldMutate: originalFile.shouldMutate });
        } else {
          runnerFiles.push(originalFile);
        }
      });
      return {
        index,
        sourceFileMap,
        runnerAdapter: IsolatedTestRunnerAdapterFactory.create(this.createTestRunSettings(runnerFiles, selector, index, false)),
        selector
      };
    });
  }

  private copyAllSourceFilesToTempFolder() {
    return new Promise<FileMap>((resolve, reject) => {
      let fileMap: FileMap = Object.create(null);
      var tempFolder = StrykerTempFolder.createRandomFolder('test-runner-source-files');
      log.debug('Making a sandbox for source files in %s', tempFolder);
      let copyPromises: Promise<any>[] = this.files.map(file => {
        if (file.shouldMutate) {
          let targetFile = tempFolder + path.sep + path.basename(file.path);
          fileMap[file.path] = targetFile;
          return StrykerTempFolder.copyFile(file.path, targetFile);
        } else {
          return Promise.resolve();
        }
      });
      Promise.all(copyPromises).then(() => { resolve(fileMap); }, reject);
    });
  }

  private createTestRunSettings(files: InputFile[], selector: TestSelector, index: number, coverageEnabled: boolean): RunnerOptions {
    let settings = {
      coverageEnabled,
      files: selector.files().map(f => { return { path: f, shouldMutate: false }; }).concat(files),
      strykerOptions: this.options,
      port: this.options.port + index
    };
    log.debug(`Creating test runner %s using settings {port: %s, coverageEnabled: %s}`, index, settings.port, settings.coverageEnabled);
    return settings;
  }
}