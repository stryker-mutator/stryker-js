import fs from 'fs';

import type { FileSystem } from '@typescript/native/unstable/fs';
import { Mutant } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { toPosixFileName } from '../tsconfig-helpers.js';

import { positionToOffset } from './text-helpers.js';
import { PositionConverter } from './position-converter.js';

/**
 * A simple overlay file system for the native TypeScript compiler (TypeScript 7).
 * * Files are read from disk, except for files that are overridden in-memory (mutated files and the adjusted tsconfig file)
 * * Writes are ignored, output should never be written to disk during mutation testing
 */
export class NativeFileSystem {
  readonly #overrides = new Map<string, string>();
  readonly #projectFiles = new Map<string, string>();
  readonly #positionConverters = new Map<string, PositionConverter>();

  get projectFiles(): ReadonlyMap<string, string> {
    return this.#projectFiles;
  }
  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public async markProjectFile(
    fileName: string,
    content?: string,
  ): Promise<void> {
    const posixFileName = toPosixFileName(fileName);
    if (this.#projectFiles.has(posixFileName)) {
      return;
    }
    const fileContent =
      content ?? (await fs.promises.readFile(fileName, 'utf-8'));
    this.#projectFiles.set(posixFileName, fileContent);
    this.#positionConverters.set(
      posixFileName,
      new PositionConverter(fileContent),
    );
  }

  public getPositionConverter(
    fileName: string | undefined,
  ): PositionConverter | undefined {
    if (!fileName) {
      return undefined;
    }
    return this.#positionConverters.get(toPosixFileName(fileName));
  }

  /**
   * The file system callbacks to provide to the native TypeScript compiler.
   * Returning `undefined` from `readFile` makes the compiler fall back to the real file system.
   */
  public readonly tsFileSystem: FileSystem = {
    readFile: (fileName) => {
      const posixFileName = toPosixFileName(fileName);
      return (
        this.#overrides.get(posixFileName) ??
        this.#projectFiles.get(posixFileName)
      );
    },
    writeFile: (fileName) => {
      this.log.trace('Ignoring write to file "%s"', fileName);
    },
  };

  /**
   * Applies a mutant to the original (on disk) content of its file
   */
  public mutate(
    mutant: Pick<Mutant, 'fileName' | 'location' | 'replacement'>,
  ): void {
    const fileName = toPosixFileName(mutant.fileName);
    const originalContent = this.#projectFiles.get(fileName);
    if (!originalContent) {
      throw new Error(
        `Cannot mutate file "${fileName}" because it is not part of the TypeScript project.`,
      );
    }
    const start = positionToOffset(originalContent, mutant.location.start);
    const end = positionToOffset(originalContent, mutant.location.end);
    this.#overrides.set(
      fileName,
      `${originalContent.substring(0, start)}${mutant.replacement}${originalContent.substring(end)}`,
    );
  }

  /**
   * Removes the in-memory override of a file, so the original (on disk) content is used again
   */
  public restore(fileName: string): void {
    this.#overrides.delete(toPosixFileName(fileName));
  }
}
