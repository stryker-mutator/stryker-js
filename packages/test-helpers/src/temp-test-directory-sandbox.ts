import fs from 'fs';
import path from 'path';

import { fsPromisesCp } from './fs-promises-cp.js';

/**
 * Utility class that can be used to create a temp dir and populate it with a project.
 * This is useful, because esm means that a test project cannot be loaded twice directly.
 * This helper class will copy a test project to a random test folder, which will make sure it can be loaded as many times as integration tests demand.
 *
 * The temp dir will be created under {cwd}/testResources/tmp/workDir-{random}
 */
export class TempTestDirectorySandbox {
  public tmpDir!: string;
  private originalWorkingDir: string | undefined;
  private readonly from;
  private readonly soft;
  constructor(from: string, { soft = false }: { soft?: boolean } = {}) {
    this.from = path.resolve('testResources', from);
    this.soft = soft;
  }

  /**
   * Copies all files `from` to the temp test directory
   */
  public async init(): Promise<void> {
    this.originalWorkingDir = process.cwd();
    if (this.soft) {
      this.tmpDir = path.resolve(this.from);
    } else {
      this.tmpDir = path.resolve(this.originalWorkingDir, 'testResources', 'tmp', `workDir-${random()}`);
      await fsPromisesCp(this.from, this.tmpDir, { recursive: true });
    }
    process.chdir(this.tmpDir);
  }

  /**
   * Deletes the temp file
   */
  public async dispose(): Promise<void> {
    if (!this.originalWorkingDir) {
      throw new Error('Disposed without initialized');
    }
    process.chdir(this.originalWorkingDir);
    if (!this.soft) {
      await this.rm();
    }
  }

  private async rm(retries = 5) {
    try {
      await fs.promises.rm(this.tmpDir, { recursive: true, force: true });
    } catch (err) {
      if (retries > 0) {
        await sleep();
        await this.rm(retries - 1);
      } else {
        throw err;
      }
    }
  }
}

function sleep(n = 10) {
  return new Promise((res) => setTimeout(res, n));
}

function random(): number {
  return Math.ceil(Math.random() * 10000000);
}
