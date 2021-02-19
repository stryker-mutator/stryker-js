import path from 'path';
import { promises as fsPromises } from 'fs';

import execa from 'execa';
import npmRunPath from 'npm-run-path';
import { StrykerOptions, File } from '@stryker-mutator/api/core';
import { normalizeWhitespaces, I } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens, Disposable } from '@stryker-mutator/api/plugin';
import { mergeMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';

import { TemporaryDirectory } from '../utils/temporary-directory';
import { findNodeModulesList, MAX_CONCURRENT_FILE_IO, moveDirectoryRecursiveSync, symlinkJunction, mkdirp } from '../utils/file-utils';
import { coreTokens } from '../di';
import { UnexpectedExitHandler } from '../unexpected-exit-handler';

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
    unexpectedExitHandler: I<UnexpectedExitHandler>
  ) {
    if (options.inPlace) {
      this.workingDirectory = process.cwd();
      this.backupDirectory = temporaryDirectory.createRandomDirectory('backup');
      this.log.info(
        'In place mode is enabled, Stryker will be overriding YOUR files. Find your backup at: %s',
        path.relative(process.cwd(), this.backupDirectory)
      );
      unexpectedExitHandler.registerHandler(this.dispose.bind(this, true));
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
      this.log.info('Running build command "%s" in "%s".', this.options.buildCommand, this.workingDirectory);
      this.log.debug('(using PATH: %s)', env.PATH);
      await this.exec.command(this.options.buildCommand, { cwd: this.workingDirectory, env });
    }
  }

  private async symlinkNodeModulesIfNeeded(): Promise<void> {
    this.log.debug('Start symlink node_modules');
    if (this.options.symlinkNodeModules && !this.options.inPlace) {
      // TODO: Change with this.options.basePath when we have it
      const basePath = process.cwd();
      const nodeModulesList = await findNodeModulesList(basePath, this.options.tempDirName);

      if (nodeModulesList.length > 0) {
        for (const nodeModules of nodeModulesList) {
          this.log.debug(`Create symlink from ${path.resolve(nodeModules)} to ${path.join(this.workingDirectory, nodeModules)}`);
          await symlinkJunction(path.resolve(nodeModules), path.join(this.workingDirectory, nodeModules)).catch((error: NodeJS.ErrnoException) => {
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
        }
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
      if (!originalContent.equals(file.content)) {
        // File is changed (either mutated or by a preprocessor), make a backup and replace in-place
        const backupFileName = path.join(this.backupDirectory, relativePath);
        await mkdirp(path.dirname(backupFileName));
        await fsPromises.writeFile(backupFileName, originalContent);
        this.log.debug('Stored backup file at %s', backupFileName);
        await fsPromises.writeFile(file.name, file.content);
      }
    } else {
      const folderName = path.join(this.workingDirectory, path.dirname(relativePath));
      await mkdirp(folderName);
      const targetFileName = path.join(folderName, path.basename(relativePath));
      this.fileMap.set(file.name, targetFileName);
      await fsPromises.writeFile(targetFileName, file.content);
    }
  }

  public dispose(unexpected = false): void {
    if (this.backupDirectory) {
      if (unexpected) {
        console.error(`Detecting unexpected exit, recovering original files from ${path.relative(process.cwd(), this.backupDirectory)}`);
      } else {
        this.log.info(`Resetting your original files from ${path.relative(process.cwd(), this.backupDirectory)}.`);
      }
      moveDirectoryRecursiveSync(this.backupDirectory, this.workingDirectory);
    }
  }
}
