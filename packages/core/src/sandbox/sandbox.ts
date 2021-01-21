import path = require('path');
import { promises as fsPromises } from 'fs';
import os = require('os');

import execa = require('execa');
import npmRunPath = require('npm-run-path');
import { StrykerOptions } from '@stryker-mutator/api/core';
import { File } from '@stryker-mutator/api/core';
import { normalizeWhitespaces, I } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens, Disposable } from '@stryker-mutator/api/plugin';
import { mergeMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';

import { TemporaryDirectory } from '../utils/temporary-directory';
import { findNodeModules, MAX_CONCURRENT_FILE_IO, moveDirectoryRecursiveSync, symlinkJunction, writeFile, mkdirp } from '../utils/file-utils';
import { coreTokens } from '../di';
import { random } from '../utils/object-utils';
import { UnexpectedExitRegister } from '../stryker-registry';

export class Sandbox implements Disposable {
  private readonly fileMap = new Map<string, string>();
  public readonly workingDirectory: string;
  private readonly backupDirectory: string = '';

  public static readonly inject = tokens(
    commonTokens.options,
    commonTokens.logger,
    coreTokens.temporaryDirectory,
    coreTokens.files,
    coreTokens.execa,
    coreTokens.unexpectedExitRegistry
  );

  constructor(
    private readonly options: StrykerOptions,
    private readonly log: Logger,
    temporaryDirectory: I<TemporaryDirectory>,
    private readonly files: readonly File[],
    private readonly exec: typeof execa,
    unexpectedExitRegistry: UnexpectedExitRegister
  ) {
    if (options.inPlace) {
      this.workingDirectory = process.cwd();
      this.backupDirectory = path.join(os.tmpdir(), `stryker-backup-${random()}`);
      this.log.info('In place mode detected. Stryker will be overriding YOUR files. Find your backup at: %s', this.backupDirectory);
      unexpectedExitRegistry.registerUnexpectedExitHandler(this.dispose.bind(this, true));
    } else {
      this.workingDirectory = temporaryDirectory.createRandomDirectory('sandbox');
      this.log.debug('Creating a sandbox for files in %s', this.workingDirectory);
    }
  }

  public async init(): Promise<void> {
    await this.fillSandbox();
    await this.runBuildCommand();
    await this.symlinkNodeModulesIfNeeded();
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
    if (this.options.symlinkNodeModules && !this.options.inPlace) {
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
    if (this.options.inPlace) {
      this.fileMap.set(file.name, file.name);
      const originalContent = await fsPromises.readFile(file.name);
      if (originalContent.compare(file.content) !== 0) {
        // difference
        const backupFileName = path.join(this.backupDirectory, relativePath);
        await mkdirp(path.dirname(backupFileName));
        await fsPromises.writeFile(backupFileName, originalContent);
        this.log.debug(`Stored backup file at ${backupFileName}`);
        await writeFile(file.name, file.content);
      }
    } else {
      const folderName = path.join(this.workingDirectory, path.dirname(relativePath));
      await mkdirp(folderName);
      const targetFileName = path.join(folderName, path.basename(relativePath));
      this.fileMap.set(file.name, targetFileName);
      await writeFile(targetFileName, file.content);
    }
  }

  public dispose(unexpected = false): void {
    if (this.backupDirectory) {
      if (unexpected) {
        console.error(`Detecting unexpected exit, recovering original files from ${this.backupDirectory}`);
      } else {
        this.log.info(`Resetting your original files from ${this.backupDirectory}.`);
      }
      moveDirectoryRecursiveSync(this.backupDirectory, this.workingDirectory);
    }
  }
}
