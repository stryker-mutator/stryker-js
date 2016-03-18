import {StrykerOptions} from './api/core';
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
const PromisePool = require('es6-promise-pool')

interface FileMap {
  [sourceFile: string]: string
}

interface TestRunnerMetadata {
  runnerAdapter: IsolatedTestRunnerAdapter;
  selector: TestSelector;
  sourceFileMap: FileMap;
}

export default class TestRunnerOrchestrator {

  constructor(private options: StrykerOptions, private sourceFiles: string[], private otherFiles: string[]) {
  }

  recordCoverage(): Promise<RunResult[]> {
    let testSelector = TestSelectorFactory.instance().create(this.options.testFramework, { options: this.options });
    let testRunner = IsolatedTestRunnerAdapterFactory.create(this.createTestRunSettings(this.sourceFiles, testSelector, this.options.port, true));
    return this.runSingleTestsRecursive(testSelector, testRunner, [], 0).then((testResults) => {
      testRunner.dispose();
      return testResults;
    });
  }

  runMutations(mutants: Mutant[], reporter: BaseReporter): Promise<void> {
    mutants = _.clone(mutants); // work with a copy because we're changing state (pop'ing values)
    return this.createTestRunners().then(testRunners => {
      let promiseProducer = () => {
        if (mutants.length === 0) {
          return null; // we're done
        } else {
          var mutant = mutants.pop();
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
        }
      }
      return new PromisePool(promiseProducer, testRunners.length)
        .start()
        .then(() => testRunners.forEach( testRunner => testRunner.runnerAdapter.dispose()));
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
          if (runResult.succeeded > 0 || runResult.failed > 0) {
            runResults[currentTestIndex] = runResult;
            resolve(this.runSingleTestsRecursive(testSelector, testRunner, runResults, currentTestIndex + 1));
          } else {
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
      console.log(`INFO: Creating ${cpuCount} test runners (based on cpu count)`);
      for (let i = 0; i < cpuCount; i++) {
        allPromises.push(this.createTestRunner(i).then(testRunnerMetadata => testRunnerMetadatas.push(testRunnerMetadata)));
      }
      Promise.all(allPromises).then(() => resolve(testRunnerMetadatas));
    });
  }

  private createTestRunner(portOffset: number): Promise<TestRunnerMetadata> {
    return this.copyAllSourceFilesToTempFolder().then(sourceFileMap => {
      let selector = TestSelectorFactory.instance().create(this.options.testFramework, { options: this.options });
      let tempSourceFiles: string[] = [];
      for (let i in sourceFileMap) {
        tempSourceFiles.push(sourceFileMap[i]);
      }
      return {
        sourceFileMap,
        runnerAdapter: IsolatedTestRunnerAdapterFactory.create(this.createTestRunSettings(tempSourceFiles, selector, this.options.port + portOffset, false)),
        selector
      };
    });
  }

  private copyAllSourceFilesToTempFolder() {
    return new Promise<FileMap>((resolve, reject) => {
      let fileMap: FileMap = Object.create(null);
      var tempFolder = StrykerTempFolder.createRandomFolder('test-runner-source-files');
      let copyPromises: Promise<void>[] = this.sourceFiles.map(sourceFile => {
        let targetFile = tempFolder + path.sep + path.basename(sourceFile);
        fileMap[sourceFile] = targetFile;
        return StrykerTempFolder.copyFile(sourceFile, targetFile);
      });
      Promise.all(copyPromises).then(() => { resolve(fileMap); }, reject);
    });
  }

  private createTestRunSettings(sourceFiles: string[], selector: TestSelector, port: number, coverageEnabled: boolean): RunnerOptions {
    return {
      coverageEnabled,
      sourceFiles: sourceFiles,
      additionalFiles: [].concat(selector.files()).concat(this.otherFiles),
      strykerOptions: this.options,
      port: port
    };
  }
}