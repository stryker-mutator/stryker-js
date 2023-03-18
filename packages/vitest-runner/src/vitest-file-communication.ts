import fs from 'fs/promises';

import { Mutant } from '@stryker-mutator/api/core';

import { resolveSetupFile } from './utils/resolve-setup-file.js';

export async function setDryRunValue(dryRun: boolean): Promise<void> {
  try {
    const content = `
        globalThis.strykerDryRun = ${dryRun}
      `;
    const fileName = resolveSetupFile('dry-run.js');
    await fs.writeFile(fileName, content);
  } catch (err) {
    console.error(err);
  }
}

export async function setHitLimit(globalNamespace: string, hitLimit?: number): Promise<void> {
  if (hitLimit) {
    try {
      const content = `
        const ns = globalThis.${globalNamespace} || (globalThis.${globalNamespace} = {});
        ns.hitLimit = ${hitLimit}
      `;
      const fileName = resolveSetupFile('hit-limit.js');
      await fs.writeFile(fileName, content);
    } catch (err) {
      console.error(err);
    }
  }
}

export async function setActiveMutant(mutant: Mutant, setInBeforeEach: boolean, globalNamespace: string): Promise<void> {
  try {
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
    await fs.writeFile(resolveSetupFile('active-mutant.js'), content);
  } catch (err) {
    console.error(err);
  }
}
