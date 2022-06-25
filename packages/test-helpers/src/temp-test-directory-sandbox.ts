import fs from 'fs';
import path from 'path';

import { fsPromisesCp } from './fs-promises-cp.js';

export class TempTestDirectorySandbox {
  private tmpDir: string | undefined;
  private originalWorkingDir: string | undefined;
  constructor(private readonly from: string) {}

  public async init(): Promise<void> {
    this.originalWorkingDir = process.cwd();
    this.tmpDir = path.resolve(this.originalWorkingDir, 'testResources', 'tmp', `workDir-${random()}`);
    await fsPromisesCp(this.from, this.tmpDir, { recursive: true });
    process.chdir(this.tmpDir);
  }

  public async dispose(): Promise<void> {
    if (!this.originalWorkingDir || !this.tmpDir) {
      throw new Error('Disposed without initialized');
    }
    process.chdir(this.originalWorkingDir);
    await fs.promises.rm(this.tmpDir, { recursive: true, force: true });
  }
}

function random(): number {
  return Math.ceil(Math.random() * 10000000);
}
