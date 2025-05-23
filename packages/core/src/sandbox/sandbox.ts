import path from 'path';

import type { execaCommand } from 'execa';
import { npmRunPathEnv } from 'npm-run-path';
import { StrykerOptions } from '@stryker-mutator/api/core';
import {
  normalizeWhitespaces,
  I,
  isErrnoException,
} from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens, Disposable } from '@stryker-mutator/api/plugin';

import { TemporaryDirectory } from '../utils/temporary-directory.js';
import { fileUtils } from '../utils/file-utils.js';
import { coreTokens } from '../di/index.js';
import { UnexpectedExitHandler } from '../unexpected-exit-handler.js';
import { ProjectFile } from '../fs/index.js';
import { Project } from '../fs/project.js';
import { objectUtils } from '../utils/index.js';

export class Sandbox implements Disposable {
  private readonly fileMap = new Map<string, string>();

  /**
   * The working directory for this sandbox
   * Either an actual sandbox directory, or the cwd when running in --inPlace mode
   */
  public readonly workingDirectory: string;
  /**11
   * The backup directory when running in --inPlace mode
   */
  private readonly backupDirectory: string = '';

  public static readonly inject = tokens(
    commonTokens.options,
    commonTokens.logger,
    coreTokens.temporaryDirectory,
    coreTokens.project,
    coreTokens.execa,
    coreTokens.unexpectedExitRegistry,
  );

  /**
   * @param temporaryDirectory The sandbox dir or the backup dir when running in `--inPlace` mode
   */
  constructor(
    private readonly options: StrykerOptions,
    private readonly log: Logger,
    temporaryDirectory: I<TemporaryDirectory>,
    private readonly project: Project,
    private readonly execCommand: typeof execaCommand,
    unexpectedExitHandler: I<UnexpectedExitHandler>,
  ) {
    if (options.inPlace) {
      this.workingDirectory = process.cwd();
      this.backupDirectory = temporaryDirectory.path;
      this.log.info(
        'In place mode is enabled, Stryker will be overriding YOUR files. Find your backup at: %s',
        path.relative(process.cwd(), this.backupDirectory),
      );
      unexpectedExitHandler.registerHandler(
        this.dispose.bind(this, /* unexpected */ true),
      );
    } else {
      this.workingDirectory = temporaryDirectory.path;
      this.log.debug(
        'Creating a sandbox for files in %s',
        this.workingDirectory,
      );
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

  public originalFileFor(sandboxFileName: string): string {
    return path
      .resolve(sandboxFileName)
      .replace(path.resolve(this.workingDirectory), process.cwd());
  }

  private async fillSandbox(): Promise<void> {
    await Promise.all(
      objectUtils.map(this.project.files, (file, name) =>
        this.sandboxFile(name, file),
      ),
    );
  }

  private async runBuildCommand() {
    if (this.options.buildCommand) {
      const env = npmRunPathEnv();
      this.log.info(
        'Running build command "%s" in "%s".',
        this.options.buildCommand,
        this.workingDirectory,
      );
      this.log.debug('(using PATH: %s)', env.PATH);
      await this.execCommand(this.options.buildCommand, {
        cwd: this.workingDirectory,
        env,
      });
    }
  }

  private async symlinkNodeModulesIfNeeded(): Promise<void> {
    this.log.debug('Start symlink node_modules');
    if (this.options.symlinkNodeModules && !this.options.inPlace) {
      // TODO: Change with this.options.basePath when we have it
      const basePath = process.cwd();
      const nodeModulesList = await fileUtils.findNodeModulesList(
        basePath,
        this.options.tempDirName,
      );

      if (nodeModulesList.length > 0) {
        for (const nodeModules of nodeModulesList) {
          this.log.debug(
            `Create symlink from ${path.resolve(nodeModules)} to ${path.join(this.workingDirectory, nodeModules)}`,
          );
          await fileUtils
            .symlinkJunction(
              path.resolve(nodeModules),
              path.join(this.workingDirectory, nodeModules),
            )
            .catch((error: unknown) => {
              if (isErrnoException(error) && error.code === 'EEXIST') {
                this.log.warn(
                  normalizeWhitespaces(`Could not symlink "${nodeModules}" in sandbox directory,
              it is already created in the sandbox. Please remove the node_modules from your sandbox files.
              Alternatively, set \`symlinkNodeModules\` to \`false\` to disable this warning.`),
                );
              } else {
                this.log.warn(
                  `Unexpected error while trying to symlink "${nodeModules}" in sandbox directory.`,
                  error,
                );
              }
            });
        }
      } else {
        this.log.debug(
          `Could not find a node_modules folder to symlink into the sandbox directory. Search "${basePath}" and its parent directories`,
        );
      }
    }
  }

  /**
   * Sandboxes a file (writes it to the sandbox). Either in-place, or an actual sandbox directory.
   * @param name The name of the file
   * @param file The file reference
   */
  private async sandboxFile(name: string, file: ProjectFile): Promise<void> {
    if (this.options.inPlace) {
      if (file.hasChanges) {
        // File is changed (either mutated or by a preprocessor), make a backup and replace in-place
        const backupFileName = await file.backupTo(this.backupDirectory);
        this.log.debug('Stored backup file at %s', backupFileName);
        await file.writeInPlace();
      }
      this.fileMap.set(name, name);
    } else {
      const targetFileName = await file.writeToSandbox(this.workingDirectory);
      this.fileMap.set(name, targetFileName);
    }
  }

  public dispose(unexpected = false): void {
    if (this.backupDirectory) {
      if (unexpected) {
        console.error(
          `Detecting unexpected exit, recovering original files from ${path.relative(process.cwd(), this.backupDirectory)}`,
        );
      } else {
        this.log.info(
          `Resetting your original files from ${path.relative(process.cwd(), this.backupDirectory)}.`,
        );
      }
      fileUtils.moveDirectoryRecursiveSync(
        this.backupDirectory,
        this.workingDirectory,
      );
    }
  }
}
