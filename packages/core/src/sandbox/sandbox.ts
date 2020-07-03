import * as path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { File } from '@stryker-mutator/api/core';
import { normalizeWhitespaces, I } from '@stryker-mutator/util';
import * as mkdirp from 'mkdirp';
import { Logger, LoggerFactoryMethod } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { TemporaryDirectory } from '../utils/TemporaryDirectory';
import { findNodeModules, symlinkJunction, writeFile } from '../utils/fileUtils';
import { coreTokens } from '../di';

interface SandboxFactory {
  (options: StrykerOptions, getLogger: LoggerFactoryMethod, files: File[], tempDir: I<TemporaryDirectory>): Promise<Sandbox>;
  inject: [typeof commonTokens.options, typeof commonTokens.getLogger, typeof coreTokens.files, typeof coreTokens.temporaryDirectory];
}

export class Sandbox {
  private readonly fileMap = new Map<string, string>();
  public readonly workingDirectory: string;

  private constructor(
    private readonly options: StrykerOptions,
    private readonly log: Logger,
    temporaryDirectory: I<TemporaryDirectory>,
    private readonly files: File[]
  ) {
    this.workingDirectory = temporaryDirectory.createRandomDirectory('sandbox');
    this.log.debug('Creating a sandbox for files in %s', this.workingDirectory);
  }

  private async initialize(): Promise<void> {
    await this.fillSandbox();
    await this.symlinkNodeModulesIfNeeded();
  }

  public static create: SandboxFactory = Object.assign(
    async (options: StrykerOptions, getLogger: LoggerFactoryMethod, files: File[], tempDir: I<TemporaryDirectory>): Promise<Sandbox> => {
      const sandbox = new Sandbox(options, getLogger(Sandbox.name), tempDir, files);
      await sandbox.initialize();
      return sandbox;
    },
    { inject: tokens(commonTokens.options, commonTokens.getLogger, coreTokens.files, coreTokens.temporaryDirectory) }
  );

  public get sandboxFileNames(): string[] {
    return [...this.fileMap.entries()].map(([, to]) => to);
  }

  private fillSandbox(): Promise<void[]> {
    const copyPromises = this.files.map((file) => this.fillFile(file));
    return Promise.all(copyPromises);
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

  private fillFile(file: File): Promise<void> {
    const relativePath = path.relative(process.cwd(), file.name);
    const folderName = path.join(this.workingDirectory, path.dirname(relativePath));
    mkdirp.sync(folderName);
    const targetFileName = path.join(folderName, path.basename(relativePath));
    this.fileMap.set(file.name, targetFileName);
    return writeFile(targetFileName, file.content);
  }
}
