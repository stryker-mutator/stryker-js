import * as path from 'path';
import * as log4js from 'log4js';
import * as _ from 'lodash';
import { RunResult } from 'stryker-api/test_runner';
import { InputFile, StrykerOptions } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import { wrapInClosure } from './utils/objectUtils';
import { isOnlineFile } from './utils/fileUtils';
import IsolatedTestRunnerAdapterFactory from './isolated-runner/IsolatedTestRunnerAdapterFactory';
import IsolatedTestRunnerAdapter from './isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedRunnerOptions from './isolated-runner/IsolatedRunnerOptions';
import StrykerTempFolder from './utils/StrykerTempFolder';
import Mutant from './Mutant';
import CoverageInstrumenter from './coverage/CoverageInstrumenter';

const log = log4js.getLogger('Sandbox');

interface FileMap {
  [sourceFile: string]: string;
}

export default class Sandbox {

  private testRunner: IsolatedTestRunnerAdapter;
  private fileMap: FileMap;
  private workingFolder: string;
  private testHooksFile: string;

  constructor(private options: StrykerOptions, private index: number, private files: InputFile[], private testFramework: TestFramework, private coverageInstrumenter: CoverageInstrumenter) {
    this.workingFolder = StrykerTempFolder.createRandomFolder('sandbox');
    log.debug('Creating a sandbox for files in %s', this.workingFolder);
    this.testHooksFile = path.join(this.workingFolder, '___testHooksForStryker.js');
  }

  public async initialize(): Promise<void> {
    await this.fillSandbox();
    return this.initializeTestRunner();
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
      .then(runResult => mutant.reset(targetedFile).then(() => runResult));
  }

  private fillSandbox(): Promise<void[]> {
    this.fileMap = Object.create(null);
    let copyPromises = this.files
      .map(file => this.copyFile(file));
    if (this.coverageInstrumenter) {
      copyPromises.push(StrykerTempFolder.writeFile(this.testHooksFile, this.coverageInstrumenter.hooksForTestRun()));
    } else {
      copyPromises.push(StrykerTempFolder.writeFile(this.testHooksFile, ''));
    }
    return Promise.all(copyPromises);
  }

  private copyFile(file: InputFile): Promise<void> {
    if (isOnlineFile(file.path)) {
      this.fileMap[file.path] = file.path;
      return Promise.resolve();
    } else {
      const cwd = process.cwd();
      const relativePath = file.path.substr(cwd.length);
      const folderName = StrykerTempFolder.ensureFolderExists(this.workingFolder + path.dirname(relativePath));
      const targetFile = path.join(folderName, path.basename(relativePath));
      this.fileMap[file.path] = targetFile;
      const instrumentingStream = this.coverageInstrumenter ?
        this.coverageInstrumenter.instrumenterStreamForFile(file) : null;
      return StrykerTempFolder.copyFile(file.path, targetFile, instrumentingStream);
    }
  }

  private initializeTestRunner(): void | Promise<any> {
    let files = this.files.map(originalFile => <InputFile>_.assign(_.cloneDeep(originalFile), { path: this.fileMap[originalFile.path] }));
    files.unshift({ path: this.testHooksFile, mutated: false, included: true });
    let settings: IsolatedRunnerOptions = {
      files,
      strykerOptions: this.options,
      port: this.options.port + this.index,
      sandboxWorkingFolder: this.workingFolder
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
      let fileContent = wrapInClosure(this.testFramework.filter(mutant.scopedTestIds));
      return StrykerTempFolder.writeFile(this.testHooksFile, fileContent);
    } else {
      return Promise.resolve(void 0);
    }
  }
}