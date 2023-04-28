import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';

import { fileURLToPath } from 'url';

import { DryRunOptions, MutantRunOptions } from '@stryker-mutator/api/src/test-runner';

import { toTestId } from './utils/collect-test-name.js';

export class FileCommunicator {
  // private readonly communicationDir = path.resolve(`.vitest-runner-${process.env.STRYKER_MUTATOR_WORKER}`);
  private readonly communicationDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    `.vitest-runner-${process.env.STRYKER_MUTATOR_WORKER}`
  );

  private readonly setupFiles = {
    // Replace function is to have a valid windows path
    coverageFile: path.resolve(this.communicationDir, '__stryker-coverage__.json').replace(/\\/g, '/'),
    hitCountFile: path.resolve(this.communicationDir, 'hitCount.txt').replace(/\\/g, '/'),
  };

  constructor(private readonly globalNamespace: string) {
    if (!fsSync.existsSync(this.communicationDir)) {
      fsSync.mkdirSync(this.communicationDir);
    }
  }

  public get setupFile(): string {
    return path.resolve(this.communicationDir, 'vitest.setup.js');
  }

  public get coverageFile(): string {
    return this.setupFiles.coverageFile;
  }

  public get hitCountFile(): string {
    return this.setupFiles.hitCountFile;
  }

  public get activeMutantFile(): string {
    return path.resolve(this.communicationDir, 'active-mutant.js');
  }

  public async setDryRun(options: DryRunOptions): Promise<void> {
    // ... write content to the setup file
    await fs.writeFile(
      // Write hit count, hit limit, isDryRun, global namespace, etc. Altogether in 1 file
      this.setupFile,
      `
        ${this.getStrykerGlobalNameSpaceCode()}
        ${this.getSetupCode()}
        ${this.getDryRunCode(true)}
        ${this.getRemoveActiveMutantCode()}
    `
    );
  }

  public async setMutantRun(options: MutantRunOptions): Promise<void> {
    // ... write content to the setup file
    // Write active mutant, hit count, hit limit, isDryRun, global namespace, etc. Altogether in 1 file

    await fs.writeFile(
      this.setupFile,
      `
        ${this.getStrykerGlobalNameSpaceCode()}
        ${this.getSetupCode()}
        ${this.getActiveMutantCode(options)}
        ${this.getDryRunCode(false)}
        ${this.getHitLimitCode(options)}
      `
    );
  }

  private getRemoveActiveMutantCode() {
    return `
      const ns = globalThis.${this.globalNamespace} || (globalThis.${this.globalNamespace} = {});
      ns.activeMutant = undefined
    `;
  }

  private getStrykerGlobalNameSpaceCode() {
    return `
      globalThis.strykerGlobalNamespaceName = '${this.globalNamespace}'
    `;
  }

  private getActiveMutantCode(options: MutantRunOptions): string {
    if (options.mutantActivation !== 'static') {
      return `
          beforeEach(() => {
            const ns = globalThis.${this.globalNamespace} || (globalThis.${this.globalNamespace} = {});
            ns.activeMutant = '${options.activeMutant.id}'
          })`;
    } else {
      return `
      function foo(ns) {
          ns.activeMutant = '${options.activeMutant.id}'
          }
      foo(globalThis.${this.globalNamespace} || (globalThis.${this.globalNamespace} = {}))
      console.log(foo.toString())`;
    }
  }

  private getDryRunCode(isDryRun: boolean) {
    return `
      globalThis.strykerDryRun = ${isDryRun}
    `;
  }

  private getHitLimitCode(options: MutantRunOptions) {
    return `
      const ns = globalThis.${this.globalNamespace} || (globalThis.${this.globalNamespace} = {});
      ns.hitLimit = ${options.hitLimit}
      `;
  }

  private getSetupCode() {
    return `
      import fs from 'fs/promises';

      import { beforeEach, afterAll, beforeAll } from 'vitest';

      ${toTestId.toString()}

      beforeEach(async (a) => {
        const context = globalThis[globalThis.strykerGlobalNamespaceName] ?? (globalThis[globalThis.strykerGlobalNamespaceName] = {});
        context.currentTestId = toTestId(a.meta);
      });

      afterAll(async () => {
        if (globalThis.strykerDryRun) {
          await fs.writeFile('${this.coverageFile}', JSON.stringify(globalThis[globalThis.strykerGlobalNamespaceName]?.mutantCoverage));
        } else {
          await fs.writeFile('${this.hitCountFile}', JSON.stringify(globalThis[globalThis.strykerGlobalNamespaceName]?.hitCount));
        }
      });

      beforeAll(() => {
        const context = globalThis[globalThis.strykerGlobalNamespaceName] ?? (globalThis[globalThis.strykerGlobalNamespaceName] = {});
        context.hitCount = 0;
      });
    `;
  }
}
