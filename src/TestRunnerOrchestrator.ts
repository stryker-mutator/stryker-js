import {StrykerOptions, InputFile} from 'stryker-api/core';
import {RunResult, RunnerOptions, TestResult} from 'stryker-api/test_runner';
import {TestSelector} from 'stryker-api/test_selector';
import StrykerTempFolder from './utils/StrykerTempFolder';
import IsolatedTestRunnerAdapter from './isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedTestRunnerAdapterFactory from './isolated-runner/IsolatedTestRunnerAdapterFactory';
import * as path from 'path';
import * as os from 'os';
import * as _ from 'lodash';
import Mutant from './Mutant';
import {Reporter, MutantStatus, MutantResult} from 'stryker-api/report';
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
  fileMap: FileMap;
  testSelectionFilePath: string;
}

export default class TestRunnerOrchestrator {

  constructor(private options: StrykerOptions, private files: InputFile[], private testSelector: TestSelector, private reporter: Reporter) {
  }

  initialRun(): Promise<RunResult[]> {
    let testSelectionFilePath = this.createTestSelectorFileName(this.createTempFolder());
    let runnerAdapter = IsolatedTestRunnerAdapterFactory.create(this.createTestRunSettings(this.files, testSelectionFilePath, 0, true));
    let sandbox: TestRunnerSandbox = {
      runnerAdapter,
      fileMap: null,
      testSelectionFilePath,
      index: 0
    };
    return this.runSingleTestsRecursive(sandbox, [], 0).then((testResults) => {
      runnerAdapter.dispose();
      return testResults;
    });
  }

  runMutations(mutants: Mutant[]): Promise<MutantResult[]> {
    mutants = _.clone(mutants); // work with a copy because we're changing state (pop'ing values)
    let results: MutantResult[] = [];
    return this.createTestRunnerSandboxes().then(sandboxes => {
      let promiseProducer: () => Promise<number> | Promise<void> = () => {
        if (mutants.length === 0) {
          return null; // we're done
        } else {
          var mutant = mutants.pop();
          if (mutant.scopedTestIds.length > 0) {
            let sandbox = sandboxes.pop();
            let sourceFileCopy = sandbox.fileMap[mutant.filename];
            return Promise.all([mutant.save(sourceFileCopy), this.selectTests(sandbox, mutant.scopedTestIds)])
              .then(() => sandbox.runnerAdapter.run({ timeout: this.calculateTimeout(mutant.timeSpentScopedTests) }))
              .then((runResult) => {
                let result = this.collectFrozenMutantResult(mutant, runResult);
                results.push(result);
                this.reporter.onMutantTested(result);
                return mutant.reset(sourceFileCopy);
              })
              .then(() => sandboxes.push(sandbox)); // mark the runner as available again
          } else {
            let result = this.collectFrozenMutantResult(mutant);
            results.push(result);
            return Promise.resolve(this.reporter.onMutantTested(result));
          }
        }
      }
      return new PromisePool(promiseProducer, sandboxes.length)
        .start()
        .then(() => sandboxes.forEach(testRunner => testRunner.runnerAdapter.dispose()))
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
    let testNames: string[];
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
      testNames = runResult.testNames;
    } else {
      testNames = [];
      status = MutantStatus.UNTESTED;
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

  private runSingleTestsRecursive(sandbox: TestRunnerSandbox, runResults: RunResult[], currentTestIndex: number)
    : Promise<RunResult[]> {

    return new Promise<RunResult[]>(resolve => {
      this.selectTests(sandbox, [currentTestIndex])
        .then(() => sandbox.runnerAdapter.run({ timeout: 10000 }))
        .then(runResult => {
          if (runResult.result === TestResult.Complete && runResult.succeeded > 0 || runResult.failed > 0) {
            runResults[currentTestIndex] = runResult;
            resolve(this.runSingleTestsRecursive(sandbox, runResults, currentTestIndex + 1));
          } else {
            if (runResult.result !== TestResult.Complete) {
              // If this was iteration n+1 (n = number of tests), the runResult.result will be Complete, so we don't record it
              runResults[currentTestIndex] = runResult;
            }
            sandbox.runnerAdapter.dispose();
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

  private selectTests(sandbox: TestRunnerSandbox, ids: number[]) {
    let fileContent = this.testSelector.select(ids);
    return StrykerTempFolder.writeFile(sandbox.testSelectionFilePath, fileContent);
  }

  private createSandbox(index: number): Promise<TestRunnerSandbox> {
    var tempFolder = this.createTempFolder();
    return this.copyAllFilesToFolder(tempFolder).then(fileMap => {
      let runnerFiles: InputFile[] = [];
      let testSelectionFilePath = this.createTestSelectorFileName(tempFolder);
      this.files.forEach(originalFile => runnerFiles.push({ path: fileMap[originalFile.path], shouldMutate: originalFile.shouldMutate }));
      return {
        index,
        fileMap,
        runnerAdapter: IsolatedTestRunnerAdapterFactory.create(this.createTestRunSettings(runnerFiles, testSelectionFilePath, index, false)),
        testSelectionFilePath
      };
    });
  }

  private createTempFolder() {
    var tempFolder = StrykerTempFolder.createRandomFolder('test-runner-files');
    log.debug('Creating a sandbox for files in %s', tempFolder);
    return tempFolder;
  }

  private createTestSelectorFileName(folder: string) {
    return path.join(folder, '___testSelection.js');
  }

  private copyAllFilesToFolder(folder: string) {
    return new Promise<FileMap>((resolve, reject) => {
      let fileMap: FileMap = Object.create(null);
      let cwd = process.cwd();
      let copyPromises: Promise<any>[] = this.files.map(file => {
        let relativePath = file.path.substr(cwd.length);
        let folderName = StrykerTempFolder.ensureFolderExists(folder + path.dirname(relativePath));
        let targetFile = path.join(folderName, path.basename(relativePath));
        fileMap[file.path] = targetFile;
        return StrykerTempFolder.copyFile(file.path, targetFile);
      });
      Promise.all(copyPromises).then(() => { resolve(fileMap); }, reject);
    });
  }

  private createTestRunSettings(files: InputFile[], testSelectionFilePath: string, index: number, coverageEnabled: boolean): RunnerOptions {
    let settings = {
      coverageEnabled,
      files: [{ path: testSelectionFilePath, shouldMutate: false } ].concat(files),
      strykerOptions: this.options,
      port: this.options.port + index
    };
    log.debug(`Creating test runner %s using settings {port: %s, coverageEnabled: %s}`, index, settings.port, settings.coverageEnabled);
    return settings;
  }
}