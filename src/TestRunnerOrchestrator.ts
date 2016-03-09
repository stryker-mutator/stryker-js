import {StrykerOptions} from './api/core';
import {RunResult, RunnerOptions, TestResult} from './api/test_runner';
import {TestSelector, TestSelectorFactory} from './api/test_selector';
import {StrykerTempFolder} from './api/util';
import IsolatedTestRunnerAdapter from './isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedTestRunnerAdapterFactory from './isolated-runner/IsolatedTestRunnerAdapterFactory';
import * as path from 'path';
import * as os from 'os';
import Mutant from './Mutant';
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
    let testSelector = TestSelectorFactory.instance().create(this.options.testFrameork, { options: this.options });
    let testRunner = IsolatedTestRunnerAdapterFactory.create(this.createTestRunSettings(this.sourceFiles, testSelector, this.options.port, true));
    return this.runSingleTestsRecursive(testSelector, testRunner, [], 0);
  }

  runMutations(mutants: Mutant[]): Promise<void> {
    return this.createTestRunners().then(testRunners => {
      let promiseProducer = () => {
        if (mutants.length === 0) {
          return null; // we're done
        } else {
          var mutant = mutants.pop();
          let nextRunner = testRunners.pop();
          let sourceFileCopy = nextRunner.sourceFileMap[mutant.filename];
          return Promise.all([mutant.save(sourceFileCopy), nextRunner.selector.select([23])])
            .then(() => nextRunner.runnerAdapter.run({ timeout: 2000 }))
            .then(() => mutant.reset(sourceFileCopy))
            .then(() => testRunners.push(nextRunner)); // mark the runner as available again
        }
      }
      return new PromisePool(promiseProducer, testRunners.length).start();
    });
  }

  private runSingleTestsRecursive(testSelector: TestSelector, testRunner: IsolatedTestRunnerAdapter, runResults: RunResult[], currentTestIndex: number)
    : Promise<RunResult[]> {
    return new Promise<RunResult[]>(resolve => {
      testSelector.select([currentTestIndex]).then(() => testRunner.run({ timeout: 2000 })).then(runResult => {
        if (runResult.result === TestResult.Complete && (runResult.succeeded > 0 || runResult.failed > 0)) {
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
      let cpuCount = os.cpus.length;
      let testRunnerMetadatas: TestRunnerMetadata[] = [];
      for (let i = 0; i < cpuCount; i++) {
        ((n: number) => {
          this.copyAllSourceFilesToTempFolder().then(sourceFileMap => {
            let selector = TestSelectorFactory.instance().create(this.options.testFrameork, { options: this.options });
            let tempSourceFiles: string[] = [];
            for (let i in sourceFileMap) {
              tempSourceFiles.push(sourceFileMap[i]);
            }
            testRunnerMetadatas.push({
              sourceFileMap,
              runnerAdapter: IsolatedTestRunnerAdapterFactory.create(this.createTestRunSettings(tempSourceFiles, selector, this.options.port + n, false)),
              selector
            });
          });
        })(i);
      }
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
      additionalFiles: [].concat(selector.files).concat(this.otherFiles),
      strykerOptions: this.options,
      port: port
    };
  }
}