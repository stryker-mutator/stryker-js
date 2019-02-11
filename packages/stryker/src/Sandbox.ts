import { StrykerOptions } from 'stryker-api/core';
import * as path from 'path';
import { getLogger } from 'log4js';
import * as mkdirp from 'mkdirp';
import { RunResult, TestRunner } from 'stryker-api/test_runner';
import { File } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import { wrapInClosure, normalizeWhiteSpaces } from './utils/objectUtils';
import ResilientTestRunnerFactory from './test-runner/ResilientTestRunnerFactory';
import { TempFolder } from './utils/TempFolder';
import { writeFile, findNodeModules, symlinkJunction } from './utils/fileUtils';
import TestableMutant, { TestSelectionResult } from './TestableMutant';
import TranspiledMutant from './TranspiledMutant';
import LoggingClientContext from './logging/LoggingClientContext';

interface FileMap {
  [sourceFile: string]: string;
}

export default class Sandbox {

  private readonly log = getLogger(Sandbox.name);
  private testRunner: Required<TestRunner>;
  private fileMap: FileMap;
  private readonly workingDirectory: string;

  private constructor(
    private readonly options: StrykerOptions,
    private readonly index: number,
    private readonly files: ReadonlyArray<File>,
    private readonly testFramework: TestFramework | null,
    private readonly timeOverheadMS: number, private readonly loggingContext: LoggingClientContext) {
    this.workingDirectory = TempFolder.instance().createRandomFolder('sandbox');
    this.log.debug('Creating a sandbox for files in %s', this.workingDirectory);
  }

  private async initialize(): Promise<void> {
    await this.fillSandbox();
    await this.symlinkNodeModulesIfNeeded();
    return this.initializeTestRunner();
  }

  public static create(options: StrykerOptions, index: number, files: ReadonlyArray<File>, testFramework: TestFramework | null, timeoutOverheadMS: number, loggingContext: LoggingClientContext)
    : Promise<Sandbox> {
    const sandbox = new Sandbox(options, index, files, testFramework, timeoutOverheadMS, loggingContext);
    return sandbox.initialize().then(() => sandbox);
  }

  public run(timeout: number, testHooks: string | undefined, mutatedFileName?: string): Promise<RunResult> {
    return this.testRunner.run({ timeout, testHooks, mutatedFileName });
  }

  public dispose(): Promise<void> {
    return this.testRunner.dispose() || Promise.resolve();
  }

  public async runMutant(transpiledMutant: TranspiledMutant): Promise<RunResult> {
    const mutantFiles = transpiledMutant.transpileResult.outputFiles;
    if (transpiledMutant.mutant.testSelectionResult === TestSelectionResult.Failed) {
      this.log.warn(`Failed find coverage data for this mutant, running all tests. This might have an impact on performance: ${transpiledMutant.mutant.toString()}`);
    }
    await Promise.all(mutantFiles.map(mutatedFile => this.writeFileInSandbox(mutatedFile)));
    const runResult = await this.run(this.calculateTimeout(transpiledMutant.mutant), this.getFilterTestsHooks(transpiledMutant.mutant), this.fileMap[transpiledMutant.mutant.fileName]);
    await this.reset(mutantFiles);
    return runResult;
  }

  private reset(mutatedFiles: ReadonlyArray<File>) {
    const originalFiles = this.files.filter(originalFile => mutatedFiles.some(mutatedFile => mutatedFile.name === originalFile.name));

    return Promise.all(originalFiles.map(file => writeFile(this.fileMap[file.name], file.content)));
  }

  private writeFileInSandbox(file: File): Promise<void> {
    const fileNameInSandbox = this.fileMap[file.name];
    return writeFile(fileNameInSandbox, file.content);
  }

  private fillSandbox(): Promise<void[]> {
    this.fileMap = Object.create(null);
    const copyPromises = this.files
      .map(file => this.fillFile(file));
    return Promise.all(copyPromises);
  }

  private async symlinkNodeModulesIfNeeded(): Promise<void> {
    if (this.options.symlinkNodeModules) {
      // TODO: Change with this.options.basePath when we have it
      const basePath = process.cwd();
      const nodeModules = await findNodeModules(basePath);
      if (nodeModules) {
        await symlinkJunction(nodeModules, path.join(this.workingDirectory, 'node_modules'))
          .catch((error: NodeJS.ErrnoException) => {
            if (error.code === 'EEXIST') {
              this.log.warn(normalizeWhiteSpaces(`Could not symlink "${nodeModules}" in sandbox directory,
              it is already created in the sandbox. Please remove the node_modules from your sandbox files.
              Alternatively, set \`symlinkNodeModules\` to \`false\` to disable this warning.`));
            } else {
              this.log.warn(`Unexpected error while trying to symlink "${nodeModules}" in sandbox directory.`, error);
            }
          });
      } else {
        this.log.warn(`Could not find a node_modules folder to symlink into the sandbox directory. Search "${basePath}" and its parent directories`);
      }
    }
  }

  private fillFile(file: File): Promise<void> {
    const relativePath = path.relative(process.cwd(), file.name);
    const folderName = path.join(this.workingDirectory, path.dirname(relativePath));
    mkdirp.sync(folderName);
    const targetFile = path.join(folderName, path.basename(relativePath));
    this.fileMap[file.name] = targetFile;
    return writeFile(targetFile, file.content);
  }

  private async initializeTestRunner(): Promise<void> {
    const fileNames = Object.keys(this.fileMap).map(sourceFileName => this.fileMap[sourceFileName]);
    this.log.debug(`Creating test runner %s using settings {port: %s}`, this.index);
    this.testRunner = ResilientTestRunnerFactory.create(this.options, fileNames, this.workingDirectory, this.loggingContext);
    await this.testRunner.init();
  }

  private calculateTimeout(mutant: TestableMutant) {
    const baseTimeout = mutant.timeSpentScopedTests;
    return (this.options.timeoutFactor * baseTimeout) + this.options.timeoutMS + this.timeOverheadMS;
  }

  private getFilterTestsHooks(mutant: TestableMutant): string | undefined {
    if (this.testFramework) {
      return wrapInClosure(this.testFramework.filter(mutant.selectedTests));
    } else {
      return undefined;
    }
  }
}
