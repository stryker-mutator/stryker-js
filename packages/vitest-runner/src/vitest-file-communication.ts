import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { Mutant } from '@stryker-mutator/api/core';

export type StrykerNamespace = '__stryker__' | '__stryker2__';

export const setupFiles = {
  coverageFile: resolveSetupFile('__stryker-coverage__.json'),
  dryRun: resolveSetupFile('dry-run.js'),
  globalNamespace: resolveSetupFile('global-namespace.js'),
  hitCountFile: resolveSetupFile('hitCount.txt'),
  activeMutant: resolveSetupFile('active-mutant.js'),
  vitestSetup: resolveSetupFile('vitest-setup.js'),
  hitLimit: resolveSetupFile('hit-limit.js'),
};
function resolveSetupFile(fileName: string): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), './setup', fileName);
}

export async function setDryRunValue(dryRun: boolean): Promise<void> {
  await fs.writeFile(
    setupFiles.dryRun,
    `
  globalThis.strykerDryRun = ${dryRun}
`
  );
}

export async function setGlobalNamespace(globalNamespace: StrykerNamespace): Promise<void> {
  await fs.writeFile(setupFiles.globalNamespace, `globalThis.strykerGlobalNamespace = '${globalNamespace}'`);
}

export async function setHitLimit(globalNamespace: string, hitLimit?: number): Promise<void> {
  const content = hitLimit
    ? `
        const ns = globalThis.${globalNamespace} || (globalThis.${globalNamespace} = {});
        ns.hitLimit = ${hitLimit}
      `
    : '';
  await fs.writeFile(setupFiles.hitLimit, content);
}

export async function disableMutant(globalNamespace: StrykerNamespace): Promise<void> {
  await fs.writeFile(
    setupFiles.activeMutant,
    `const ns = globalThis.${globalNamespace} || (globalThis.${globalNamespace} = {});
  ns.activeMutant = undefined`
  );
}
export async function setActiveMutant(mutant: Mutant, setInBeforeEach: boolean, globalNamespace: string): Promise<void> {
  let content = '';
  if (setInBeforeEach) {
    content = `
          import { beforeEach } from 'vitest';
          beforeEach(() => {
            const ns = globalThis.${globalNamespace} || (globalThis.${globalNamespace} = {});
            ns.activeMutant = '${mutant.id}'
          })`;
  } else {
    content = `(function (ns) {
          ns.activeMutant = '${mutant.id}'
          })(globalThis.${globalNamespace} || (globalThis.${globalNamespace} = {}))`;
  }
  await fs.writeFile(setupFiles.activeMutant, content);
}
