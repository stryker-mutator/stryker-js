import {StrykerOptions, InputFile} from './api/core';
import {RunResult, RunnerOptions, TestResult} from './api/test_runner';
import {TestSelector, TestSelectorFactory} from './api/test_selector';
import {StrykerTempFolder} from './api/util';
import IsolatedTestRunnerAdapter from './isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedTestRunnerAdapterFactory from './isolated-runner/IsolatedTestRunnerAdapterFactory';
import * as path from 'path';
import * as os from 'os';
import * as _ from 'lodash';
import Mutant, {MutantStatus} from './Mutant';
import BaseReporter from './reporters/BaseReporter';
import * as log4js from 'log4js';
const PromisePool = require('es6-promise-pool')

const log = log4js.getLogger('TestRunnerOrchestrator');

interface FileMap {
  [sourceFile: string]: string
}

interface TestRunnerMetadata {
  index: number;
  runnerAdapter: IsolatedTestRunnerAdapter;
  selector: TestSelector;
  sourceFileMap: FileMap;
}

export default class TestRunnerOrchestrator {

  constructor(private options: StrykerOptions, private files: InputFile[]) {
  }

  recordCoverage(): Promise<RunResult[]> {
    let testSelector = TestSelectorFactory.instance().create(this.options.testFramework, { options: this.options });
    let testRunner = IsolatedTestRunnerAdapterFactory.create(this.createTestRunSettings(this.files, testSelector, 0, true));
    return this.runSingleTestsRecursive(testSelector, testRunner, [], 0).then((testResults) => {
      testRunner.dispose();
      return testResults;
    });
  }

  runMutations(mutants: Mutant[], reporter: BaseReporter): Promise<void> {
    mutants = _.clone(mutants); // work with a copy because we're changing state (pop'ing values)
    return this.createTestRunners().then(testRunners => {
      let promiseProducer: () => Promise<number> | Promise<void> = () => {
        if (mutants.length === 0) {
          return null; // we're done
        } else {
          var mutant = mutants.pop(); 
          if (mutant.scopedTestIds.length > 0) {
            let nextRunner = testRunners.pop();
            let sourceFileCopy = nextRunner.sourceFileMap[mutant.filename];
            return Promise.all([mutant.save(sourceFileCopy), nextRunner.selector.select(mutant.scopedTestIds)])
              .then(() => nextRunner.runnerAdapter.run({ timeout: this.calculateTimeout(mutant.timeSpentScopedTests) }))
              .then((runResult) => {
                this.updateMutantStatus(mutant, runResult);
                reporter.mutantTested(mutant);
                return mutant.reset(sourceFileCopy);
              })
              .then(() => testRunners.push(nextRunner)); // mark the runner as available again
          } else {
            return Promise.resolve(reporter.mutantTested(mutant));
          }
        }
      }
      return new PromisePool(promiseProducer, testRunners.length)
        .start()
        .then(() => testRunners.forEach(testRunner => testRunner.runnerAdapter.dispose()));
    });
  }

  private calculateTimeout(baseTimeout: number) {
    return (this.options.timeoutFactor * baseTimeout) + this.options.timeoutMs;
  }

  private updateMutantStatus(mutant: Mutant, runResult: RunResult) {
    switch (runResult.result) {
      case TestResult.Timeout:
        mutant.status = MutantStatus.TIMEDOUT;
        break;
      case TestResult.Complete:
        if (runResult.failed > 0) {
          mutant.status = MutantStatus.KILLED;
        } else {
          mutant.status = MutantStatus.SURVIVED;
        }
        break;
    }
    mutant.specsRan = runResult.specNames;
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

  private createTestRunners(): Promise<TestRunnerMetadata[]> {

    return new Promise<TestRunnerMetadata[]>((resolve, reject) => {
      let cpuCount = os.cpus().length;
      let testRunnerMetadatas: TestRunnerMetadata[] = [];
      let allPromises: Promise<any>[] = [];
      log.info(`Creating ${cpuCount} test runners (based on cpu count)`);
      for (let i = 0; i < cpuCount; i++) {
        allPromises.push(this.createTestRunner(i).then(testRunnerMetadata => testRunnerMetadatas.push(testRunnerMetadata)));
      }
      Promise.all(allPromises).then(() => resolve(testRunnerMetadatas));
    });
  }

  private createTestRunner(index: number): Promise<TestRunnerMetadata> {
    return this.createSandbox().then(sourceFileMap => {
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

  private createSandbox() {
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