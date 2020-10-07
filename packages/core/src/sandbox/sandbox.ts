import path = require('path');

import execa = require('execa');
import npmRunPath = require('npm-run-path');
import { StrykerOptions } from '@stryker-mutator/api/core';
import { File } from '@stryker-mutator/api/core';
import { normalizeWhitespaces, I } from '@stryker-mutator/util';
import * as mkdirp from 'mkdirp';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { mergeMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';

import { TemporaryDirectory } from '../utils/TemporaryDirectory';
import { findNodeModules, MAX_CONCURRENT_FILE_IO, symlinkJunction, writeFile } from '../utils/fileUtils';
import { coreTokens } from '../di';

interface SandboxFactory {
  (options: StrykerOptions, getLogger: LoggerFactoryMethod, files: readonly File[], tempDir: I<TemporaryDirectory>, exec: typeof execa): Promise<
    Sandbox
  >;
  inject: [
    typeof commonTokens.options,
    typeof commonTokens.getLogger,
    typeof coreTokens.files,
    typeof coreTokens.temporaryDirectory,
    typeof coreTokens.execa
  ];
}

export class Sandbox {
  private readonly fileMap = new Map<string, string>();
  public readonly workingDirectory: string;

  private constructor(
    private readonly options: StrykerOptions,
    private readonly log: Logger,
    temporaryDirectory: I<TemporaryDirectory>,
    private readonly files: readonly File[],
    private readonly exec: typeof execa
  ) {
    this.workingDirectory = temporaryDirectory.createRandomDirectory('sandbox');
    this.log.debug('Creating a sandbox for files in %s', this.workingDirectory);
  }

  private async initialize(): Promise<void> {
    await this.fillSandbox();
    await this.runBuildCommand();
    await this.symlinkNodeModulesIfNeeded();
  }

  public static create: SandboxFactory = Object.assign(
    async (
      options: StrykerOptions,
      getLogger: LoggerFactoryMethod,
      files: readonly File[],
      tempDir: I<TemporaryDirectory>,
      exec: typeof execa
    ): Promise<Sandbox> => {
      const sandbox = new Sandbox(options, getLogger(Sandbox.name), tempDir, files, exec);
      await sandbox.initialize();
      return sandbox;
    },
    { inject: tokens(commonTokens.options, commonTokens.getLogger, coreTokens.files, coreTokens.temporaryDirectory, coreTokens.execa) }
  );

  public get sandboxFileNames(): string[] {
    return [...this.fileMap.entries()].map(([, to]) => to);
  }

  public sandboxFileFor(fileName: string): string {
    const sandboxFileName = this.fileMap.get(fileName);
    if (sandboxFileName === undefined) {
      throw new Error(`Cannot find sandbox file for ${fileName}`);
    }
    return sandboxFileName;
  }

  private fillSandbox(): Promise<void[]> {
    return from(this.files)
      .pipe(
        mergeMap((file) => this.fillFile(file), MAX_CONCURRENT_FILE_IO),
        toArray()
      )
      .toPromise();
  }

  private async runBuildCommand() {
    if (this.options.buildCommand) {
      const env = npmRunPath.env();
      this.log.info('Running build command "%s" in the sandbox at "%s".', this.options.buildCommand, this.workingDirectory);
      this.log.debug('(using PATH: %s)', env.PATH);
      await this.exec.command(this.options.buildCommand, { cwd: this.workingDirectory, env });
    }
  }

  private async symlinkNodeModulesIfNeeded(): Promise<void> {
    if (this.options.symlinkNodeModules) {
      // TODO: Change with this.options.basePath when we have it
      const basePath = process.cwd();
      const nodeModules = await findNodeModules(basePath);
      if (nodeModules) {
        await symlinkJunction(nodeModules, path.join(this.workingDirectory, 'node_modules')).catch((error: NodeJS.ErrnoException) => {
          if (error.code === 'EEXIST') {
            this.log.warn(
              normalizeWhitespaces(`Could not symlink "${nodeModules}" in sandbox directory,
              it is already created in the sandbox. Please remove the node_modules from your sandbox files.
              Alternatively, set \`symlinkNodeModules\` to \`false\` to disable this warning.`)
            );
          } else {
            this.log.warn(`Unexpected error while trying to symlink "${nodeModules}" in sandbox directory.`, error);
          }
        });
      } else {
        this.log.warn(`Could not find a node_modules folder to symlink into the sandbox directory. Search "${basePath}" and its parent directories`);
      }
    }
  }

  private async fillFile(file: File): Promise<void> {
    const relativePath = path.relative(process.cwd(), file.name);
    const folderName = path.join(this.workingDirectory, path.dirname(relativePath));
    mkdirp.sync(folderName);
    const targetFileName = path.join(folderName, path.basename(relativePath));
    this.fileMap.set(file.name, targetFileName);
    await writeFile(targetFileName, file.content);
  }
}
