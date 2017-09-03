import { Config } from 'stryker-api/config';
import * as path from 'path';
import * as log4js from 'log4js';
import * as _ from 'lodash';
import * as mkdirp from 'mkdirp';
import { RunResult } from 'stryker-api/test_runner';
import { InputFile } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import { wrapInClosure } from './utils/objectUtils';
import TestRunnerDecorator from './isolated-runner/TestRunnerDecorator';
import { isOnlineFile } from './utils/fileUtils';
import ResilientTestRunnerFactory from './isolated-runner/ResilientTestRunnerFactory';
import IsolatedRunnerOptions from './isolated-runner/IsolatedRunnerOptions';
import { TempFolder } from './utils/TempFolder';
import Mutant from './Mutant';
import CoverageInstrumenter from './coverage/CoverageInstrumenter';

const log = log4js.getLogger('Sandbox');

interface FileMap {
  [sourceFile: string]: string;
}

export default class Sandbox {

  private testRunner: TestRunnerDecorator;
  private fileMap: FileMap;
  private workingFolder: string;
  private testHooksFile: string;

  constructor(private options: Config, private index: number, private files: InputFile[], private testFramework: TestFramework | null, private coverageInstrumenter: CoverageInstrumenter | null) {
    this.workingFolder = TempFolder.instance().createRandomFolder('sandbox');
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
    return this.testRunner.dispose() || Promise.resolve();
  }

  public async runMutant(mutant: Mutant): Promise<RunResult> {
    const targetedFile = this.fileMap[mutant.filename];
    await Promise.all([mutant.save(targetedFile), this.filterTests(mutant)]);
    let runResult = await this.run(this.calculateTimeout(mutant));
    await mutant.reset(targetedFile);
    return runResult;
  }

  private fillSandbox(): Promise<void[]> {
    this.fileMap = Object.create(null);
    let copyPromises = this.files
      .map(file => this.copyFile(file));
    if (this.coverageInstrumenter) {
      copyPromises.push(TempFolder.instance().writeFile(this.testHooksFile, this.coverageInstrumenter.hooksForTestRun()));
    } else {
      copyPromises.push(TempFolder.instance().writeFile(this.testHooksFile, ''));
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
      const folderName = this.workingFolder + path.dirname(relativePath);
      mkdirp.sync(folderName);
      const targetFile = path.join(folderName, path.basename(relativePath));
      this.fileMap[file.path] = targetFile;
      const instrumentingStream = this.coverageInstrumenter ?
        this.coverageInstrumenter.instrumenterStreamForFile(file) : null;
      return TempFolder.instance().copyFile(file.path, targetFile, instrumentingStream);
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
    this.testRunner = ResilientTestRunnerFactory.create(settings.strykerOptions.testRunner || '', settings);
    return this.testRunner.init();
  }

  private calculateTimeout(mutant: Mutant) {
    const baseTimeout = mutant.timeSpentScopedTests;
    return (this.options.timeoutFactor * baseTimeout) + this.options.timeoutMs;
  }

  private filterTests(mutant: Mutant) {
    if (this.testFramework) {
      let fileContent = wrapInClosure(this.testFramework.filter(mutant.scopedTestIds));
      return TempFolder.instance().writeFile(this.testHooksFile, fileContent);
    } else {
      return Promise.resolve(void 0);
    }
  }
}