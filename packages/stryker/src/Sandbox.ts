import { Config } from 'stryker-api/config';
import * as path from 'path';
import { getLogger } from 'stryker-api/logging';
import * as mkdirp from 'mkdirp';
import { RunResult, RunnerOptions } from 'stryker-api/test_runner';
import { File } from 'stryker-api/core';
import { TestFramework } from 'stryker-api/test_framework';
import { wrapInClosure, normalizeWhiteSpaces, timeout, unwrapTimeout } from './utils/objectUtils';
import TestRunnerDecorator from './test-runner/TestRunnerDecorator';
import ResilientTestRunnerFactory from './test-runner/ResilientTestRunnerFactory';
import { TempFolder } from './utils/TempFolder';
import { writeFile, findNodeModules, symlinkJunction } from './utils/fileUtils';
import TestableMutant, { TestSelectionResult } from './TestableMutant';
import TranspiledMutant from './TranspiledMutant';
import LoggingClientContext from './logging/LoggingClientContext';

// The initial sandbox creation should not take long at all.
// A long hang here could indicate testrunner hidden error logs
// 60 seconds
const SANDBOX_CREATE_TIMEOUT = 60 * 1000;

interface FileMap {
  [sourceFile: string]: string;
}

export default class Sandbox {

  private readonly log = getLogger(Sandbox.name);
  private testRunner: TestRunnerDecorator;
  private fileMap: FileMap;
  private readonly files: File[];
  private readonly workingDirectory: string;

  private constructor(private readonly options: Config, private readonly index: number, files: ReadonlyArray<File>, private readonly testFramework: TestFramework | null, private readonly timeOverheadMS: number, private readonly loggingContext: LoggingClientContext) {
    this.workingDirectory = TempFolder.instance().createRandomFolder('sandbox');
    this.log.debug('Creating a sandbox for files in %s', this.workingDirectory);
    this.files = files.slice(); // Create a copy
  }

  private async initialize(): Promise<void> {
    await this.fillSandbox();
    await this.symlinkNodeModulesIfNeeded();
    return this.initializeTestRunner();
  }

  public static create(options: Config, index: number, files: ReadonlyArray<File>, testFramework: TestFramework | null, timeoutOverheadMS: number, loggingContext: LoggingClientContext)
    : Promise<Sandbox> {
    const sandbox = new Sandbox(options, index, files, testFramework, timeoutOverheadMS, loggingContext);
    // throw an error if our sandbox is never set up (e.g. karma server hang)
    // https://github.com/stryker-mutator/stryker/issues/621
    return timeout<Sandbox>(
      sandbox.initialize().then(() => sandbox),
      SANDBOX_CREATE_TIMEOUT
    )
      .then(result => unwrapTimeout(result, 'Sandbox creation timed out'));
  }

  public run(timeout: number, testHooks: string | undefined): Promise<RunResult> {
    return this.testRunner.run({ timeout, testHooks });
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
    const runResult = await this.run(this.calculateTimeout(transpiledMutant.mutant), this.getFilterTestsHooks(transpiledMutant.mutant));
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

  private initializeTestRunner(): Promise<void> {
    const settings: RunnerOptions = {
      fileNames: Object.keys(this.fileMap).map(sourceFileName => this.fileMap[sourceFileName]),
      port: this.options.port + this.index,
      strykerOptions: this.options,
    };
    this.log.debug(`Creating test runner %s using settings {port: %s}`, this.index, settings.port);
    this.testRunner = ResilientTestRunnerFactory.create(settings.strykerOptions.testRunner || '', settings, this.workingDirectory, this.loggingContext);
    return this.testRunner.init();
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
