import path from 'path';
import fs from 'fs/promises';

import { MutantRunOptions } from '@stryker-mutator/api/test-runner';
import { normalizeFileName } from '@stryker-mutator/util';

import { collectTestName, toTestId } from './vitest-helpers.js';

export class FileCommunicator {
  private readonly communicationDir = path.resolve(`.vitest-runner-${process.env.STRYKER_MUTATOR_WORKER}`);

  public readonly files = Object.freeze({
    // Replace function is to have a valid windows path
    coverageDir: normalizeFileName(path.resolve(this.communicationDir, 'coverage')),
    hitCountDir: normalizeFileName(path.resolve(this.communicationDir, 'hitCount')),
    vitestSetup: normalizeFileName(path.resolve(this.communicationDir, 'vitest.setup.js')),
  });

  constructor(private readonly globalNamespace: string) {}

  public async setDryRun(): Promise<void> {
    await this.cleanCommunicationDirectories();
    await fs.writeFile(
      // Write hit count, hit limit, isDryRun, global namespace, etc. Altogether in 1 file
      this.files.vitestSetup,
      this.setupFileTemplate(`
      ns.activeMutant = undefined;
      ${collectTestName.toString()}
      ${toTestId.toString()}
  
      beforeEach((a) => {
        ns.currentTestId = toTestId(a.meta);
      });

      afterEach(() => {
        ns.currentTestId = undefined;
      });
  
      afterAll(async (suite) => {
        await fs.writeFile(path.resolve('${
          this.files.coverageDir
        }', String(suite.projectName)), JSON.stringify(ns.mutantCoverage ?? { perTest: {}, static: {}}));
      });`)
    );
  }

  public async setMutantRun(options: MutantRunOptions): Promise<void> {
    await this.cleanCommunicationDirectories();
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
      afterAll(async (suite) => {
        await fs.writeFile(path.resolve('${this.files.hitCountDir}', String(suite.projectName)), ns.hitCount.toString());
      });`)
    );
  }

  private setupFileTemplate(body: string) {
    return `
    import path from 'path';
    import fs from 'fs/promises';
    import { normalizeFileName } from '@stryker-mutator/util';

    import { beforeEach, afterAll, beforeAll, afterEach } from 'vitest';

    const ns = globalThis.${this.globalNamespace} || (globalThis.${this.globalNamespace} = {});
    ${body}`;
  }

  private async cleanCommunicationDirectories() {
    await this.dispose();
    await fs.mkdir(this.files.coverageDir, { recursive: true });
    await fs.mkdir(this.files.hitCountDir, { recursive: true });
  }

  public async dispose(): Promise<void> {
    await fs.rm(this.communicationDir, { recursive: true, force: true });
  }
}
