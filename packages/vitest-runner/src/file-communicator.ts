import path from 'path';
import fs from 'fs/promises';

import { MutantRunOptions } from '@stryker-mutator/api/test-runner';
import { normalizeFileName } from '@stryker-mutator/util';

import { collectTestName, toRawTestId } from './vitest-helpers.js';

export class FileCommunicator {
  public readonly vitestSetup = normalizeFileName(path.resolve(`.'vitest.${process.env.STRYKER_MUTATOR_WORKER}.setup.js`));

  constructor(private readonly globalNamespace: string) {}

  public async setDryRun(): Promise<void> {
    // Note: TestContext.meta got renamed to TestContext.task in vitest 1.0.0
    await fs.writeFile(
      // Write hit count, hit limit, isDryRun, global namespace, etc. Altogether in 1 file
      this.vitestSetup,

      this.setupFileTemplate(`
      ns.activeMutant = undefined;
      ${collectTestName.toString()}
      ${toRawTestId.toString()}
  
      beforeEach((a) => {
        ns.currentTestId = toRawTestId(a.meta ?? a.task);
      });

      afterEach(() => {
        ns.currentTestId = undefined;
      });
  
      afterAll(async (suite) => {
        suite.meta.mutantCoverage = ns.mutantCoverage;
      });`),
    );
  }

  public async setMutantRun(options: MutantRunOptions): Promise<void> {
    await fs.writeFile(
      this.vitestSetup,
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
        suite.meta.hitCount = ns.hitCount;
      });`),
    );
  }

  private setupFileTemplate(body: string) {
    return `
    import path from 'path';

    import { beforeEach, afterAll, beforeAll, afterEach } from 'vitest';

    const ns = globalThis.${this.globalNamespace} || (globalThis.${this.globalNamespace} = {});
    ${body}`;
  }

  public async dispose(): Promise<void> {
    await fs.rm(this.vitestSetup, { force: true });
  }
}
