import path from 'path';
import fs from 'fs/promises';

import { fileURLToPath } from 'url';

import { MutantRunOptions } from '@stryker-mutator/api/test-runner';

import { toTestId } from './utils/collect-test-name.js';

export class FileCommunicator {
  private readonly communicationDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    `.vitest-runner-${process.env.STRYKER_MUTATOR_WORKER}`
  );

  public readonly files = Object.freeze({
    // Replace function is to have a valid windows path
    coverage: path.resolve(this.communicationDir, '__stryker-coverage__.json').replace(/\\/g, '/'),
    hitCount: path.resolve(this.communicationDir, 'hitCount.txt').replace(/\\/g, '/'),
    vitestSetup: path.resolve(this.communicationDir, 'vitest.setup.js'),
  });

  constructor(private readonly globalNamespace: string) {}

  public async setDryRun(): Promise<void> {
    await this.ensureCommunicatorDirectoryExists();
    await fs.writeFile(
      // Write hit count, hit limit, isDryRun, global namespace, etc. Altogether in 1 file
      this.files.vitestSetup,
      this.setupFileTemplate(`
      ns.activeMutant = undefined;
      ${toTestId.toString()}
  
      beforeEach(async (a) => {
        ns.currentTestId = toTestId(a.meta);
      });
  
      afterAll(async () => {
        await fs.writeFile('${this.files.coverage}', JSON.stringify(ns.mutantCoverage ?? {}));
      });`)
    );
  }

  public async setMutantRun(options: MutantRunOptions): Promise<void> {
    await this.ensureCommunicatorDirectoryExists();
    await fs.writeFile(
      this.files.vitestSetup,
      this.setupFileTemplate(`
      ns.hitLimit = ${options.hitLimit};
      beforeAll(() => {
        ns.hitCount = 0;
      });
  
      ${
        options.mutantActivation === 'static'
          ? `ns.activeMutant = '${options.activeMutant.id}';`
          : `
            beforeEach(() => {
              ns.activeMutant = '${options.activeMutant.id}';
            });`
      }
      afterAll(async () => {
        await fs.writeFile('${this.files.hitCount}', ns.hitCount.toString());
      });`)
    );
  }

  private setupFileTemplate(body: string) {
    return `
    import fs from 'fs/promises';

    import { beforeEach, afterAll, beforeAll } from 'vitest';

    const ns = globalThis.${this.globalNamespace} || (globalThis.${this.globalNamespace} = {});
    ${body}`;
  }

  private async ensureCommunicatorDirectoryExists() {
    try {
      await fs.access(this.communicationDir);
    } catch {
      await fs.mkdir(this.communicationDir);
    }
  }
}
