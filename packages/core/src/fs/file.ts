import { InputFile, MutationRange } from '@stryker-mutator/api/src/core';

import { FileSystem } from './file-system.js';

export class File implements InputFile {
  #currentContent: string | undefined;
  #originalContent: string | undefined;

  constructor(private readonly fs: FileSystem, private readonly name: string, public mutate: MutationRange | boolean) {}

  public setContent(content: string): void {
    this.#currentContent = content;
  }

  public async readContent(): Promise<string> {
    if (!this.#currentContent) {
      if (!this.#originalContent) {
        this.#originalContent = await this.fs.readFile(this.name, 'utf-8');
      }
      this.#currentContent = this.#originalContent;
    }
    return this.#currentContent;
  }

  public async override(): Promise<void> {
    if (this.#currentContent) {
      await this.fs.writeFile(this.name, this.#currentContent);
    }
  }

  public async copyTo(to: string): Promise<void> {
    if (this.#currentContent) {
      await this.fs.writeFile(to, this.#currentContent);
    } else {
      await this.fs.copyFile(this.name, to);
    }
  }

  public async backup(to: string): Promise<void> {
    if (this.#originalContent) {
      await this.fs.writeFile(to, this.#originalContent);
    } else {
      await this.fs.copyFile(this.name, to);
    }
  }
}
