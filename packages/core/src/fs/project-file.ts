import path from 'path';

import { FileDescription, MutateDescription } from '@stryker-mutator/api/core';
import { File } from '@stryker-mutator/instrumenter';
import { I, StrykerError } from '@stryker-mutator/util';

import { FileSystem } from './file-system.js';

/**
 * Represents a file inside the project under test.
 * Has utility methods to help with copying it to the sandbox, or backing it up (when `--inPlace` is active)
 *
 * Assumes utf-8 as encoding when reading/writing content.
 */
export class ProjectFile implements FileDescription {
  #currentContent: string | undefined;
  #originalContent: string | undefined;
  readonly #relativePath: string;

  constructor(
    private readonly fs: I<FileSystem>,
    private readonly name: string,
    public mutate: MutateDescription,
  ) {
    this.#relativePath = path.relative(process.cwd(), this.name);
  }

  async #writeTo(to: string): Promise<void> {
    if (this.#currentContent === undefined) {
      await this.#copyTo(to);
    } else {
      await this.fs.writeFile(to, this.#currentContent, 'utf-8');
    }
  }

  /**
   * Copies the file to `to`, recreating a symbolic link instead of copying through it.
   * `fs.copyFile` follows links, so a link to a directory makes it fail with `ENOTSUP` on macOS
   * and `EISDIR` on other platforms (see #6224). Links that cannot be recreated — a file link on
   * Windows, or a platform that refuses the call — fall back to the plain copy.
   */
  async #copyTo(to: string): Promise<void> {
    if ((await this.fs.lstat(this.name)).isSymbolicLink()) {
      try {
        await this.fs.symlink(
          await this.fs.readlink(this.name),
          to,
          'junction',
        );
        return;
      } catch {
        // Not a link we can recreate here, copy the target instead.
      }
    }
    await this.fs.copyFile(this.name, to);
  }

  public setContent(content: string): void {
    this.#currentContent = content;
  }

  public async toInstrumenterFile(): Promise<File> {
    return {
      content: await this.readContent(),
      mutate: this.mutate,
      name: this.name,
    };
  }

  public async readContent(): Promise<string> {
    if (this.#currentContent === undefined) {
      this.#currentContent = await this.readOriginal();
    }
    return this.#currentContent;
  }

  public async readOriginal(): Promise<string> {
    if (this.#originalContent === undefined) {
      try {
        this.#originalContent = await this.fs.readFile(this.name, 'utf-8');
      } catch (e) {
        throw new StrykerError(`Could not read file "${this.name}"`, e);
      }
      if (this.#currentContent === undefined) {
        this.#currentContent = this.#originalContent;
      }
    }
    return this.#originalContent;
  }

  public async writeInPlace(): Promise<void> {
    if (this.#currentContent !== undefined && this.hasChanges) {
      await this.fs.writeFile(this.name, this.#currentContent, 'utf-8');
    }
  }

  public async writeToSandbox(sandboxDir: string): Promise<string> {
    const folderName = path.join(sandboxDir, path.dirname(this.#relativePath));
    const targetFileName = path.join(
      folderName,
      path.basename(this.#relativePath),
    );
    await this.fs.mkdir(path.dirname(targetFileName), { recursive: true });
    await this.#writeTo(targetFileName);
    return targetFileName;
  }

  public async backupTo(backupDir: string): Promise<string> {
    const backupFileName = path.join(backupDir, this.#relativePath);
    await this.fs.mkdir(path.dirname(backupFileName), { recursive: true });
    if (this.#originalContent === undefined) {
      await this.#copyTo(backupFileName);
    } else {
      await this.fs.writeFile(backupFileName, this.#originalContent);
    }
    return backupFileName;
  }

  public get hasChanges(): boolean {
    return this.#currentContent !== this.#originalContent;
  }
}
