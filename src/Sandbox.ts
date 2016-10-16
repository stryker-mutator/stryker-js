import * as path from 'path';
import * as log4js from 'log4js';
import * as _ from 'lodash';
import { RunnerOptions, RunResult } from 'stryker-api/test_runner';
import { InputFile, StrykerOptions } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import IsolatedTestRunnerAdapterFactory from './isolated-runner/IsolatedTestRunnerAdapterFactory';
import IsolatedTestRunnerAdapter from './isolated-runner/IsolatedTestRunnerAdapter';
import StrykerTempFolder from './utils/StrykerTempFolder';
import Mutant from './Mutant';

const log = log4js.getLogger('Sandbox');

interface FileMap {
  [sourceFile: string]: string;
}

export default class Sandbox {

  private testRunner: IsolatedTestRunnerAdapter;
  private fileMap: FileMap;
  private workingFolder: string;
  private testFrameworkHooksFile: string;

  constructor(private options: StrykerOptions, private index: number, private files: InputFile[], private testFramework: TestFramework) {
    this.workingFolder = StrykerTempFolder.createRandomFolder('sandbox');
    log.debug('Creating a sandbox for files in %s', this.workingFolder);
    if (testFramework) {
      this.testFrameworkHooksFile = path.join(this.workingFolder, '___testFrameworkHooksForStryker.js');
    }
  }

  public initialize(): Promise<any> {
    return this.copyAllFilesToFolder()
      .then(() => this.initializeTestRunner());
  }

  public run(timeout: number): Promise<RunResult> {
    return this.testRunner.run({ timeout });
  }

  public dispose(): Promise<void> {
    return this.testRunner.dispose();
  }

  public runMutant(mutant: Mutant): Promise<RunResult> {
    const targetedFile = this.fileMap[mutant.filename];
    return Promise.all([mutant.save(targetedFile), this.filterTests(mutant)])
      .then(() => this.run(this.calculateTimeout(mutant)))
      .then(runResult => mutant.reset(targetedFile)
        .then(() => runResult));
  }

  private copyAllFilesToFolder() {
    this.fileMap = Object.create(null);
    let copyPromises = this.files.map(file => this.copyFile(file));
    return Promise.all(copyPromises);
  }

  private copyFile(file: InputFile) {
    let cwd = process.cwd();
    let relativePath = file.path.substr(cwd.length);
    let folderName = StrykerTempFolder.ensureFolderExists(this.workingFolder + path.dirname(relativePath));
    let targetFile = path.join(folderName, path.basename(relativePath));
    this.fileMap[file.path] = targetFile;
    return StrykerTempFolder.copyFile(file.path, targetFile);
  }

  private initializeTestRunner(): void | Promise<any> {
    let files = this.files.map(originalFile => <InputFile>_.assign(_.cloneDeep(originalFile), { path: this.fileMap[originalFile.path] }));
    if (this.testFrameworkHooksFile) {
      files = [{ path: this.testFrameworkHooksFile, mutated: false, included: true }].concat(files);
    }
    let settings: RunnerOptions = {
      files,
      strykerOptions: this.options,
      port: this.options.port + this.index
    };
    log.debug(`Creating test runner %s using settings {port: %s}`, this.index, settings.port);
    this.testRunner = IsolatedTestRunnerAdapterFactory.create(settings);
    return this.testRunner.init();
  }

  private calculateTimeout(mutant: Mutant) {
    const baseTimeout = mutant.timeSpentScopedTests;
    return (this.options.timeoutFactor * baseTimeout) + this.options.timeoutMs;
  }

  private filterTests(mutant: Mutant) {
    if (this.testFramework) {
      let fileContent = this.testFramework.filter(mutant.scopedTestIds);
      return StrykerTempFolder.writeFile(this.testFrameworkHooksFile, fileContent);
    } else {
      return Promise.resolve(void 0);
    }
  }
}