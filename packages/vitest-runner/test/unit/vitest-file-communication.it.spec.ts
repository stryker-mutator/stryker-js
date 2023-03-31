import fs from 'fs/promises';

import { factory, TempTestDirectorySandbox } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { setActiveMutant, setDryRunValue, setHitLimit, setupFiles } from '../../src/vitest-file-communication.js';

describe('Vitest file communication', () => {
  let sandbox: TempTestDirectorySandbox;
  afterEach(async () => {
    await sandbox.dispose();
  });
  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('file-communication');
    await sandbox.init();
  });
  it('setHitLimit should write hitLimit to correct namespace', async () => {
    await setHitLimit('__stryker__', 2);
    await fs.readFile(setupFiles.hitLimit, 'utf8').then((data) => {
      expect(data).to.contain('const ns = globalThis.__stryker__ || (globalThis.__stryker__ = {});');
      expect(data).to.contain('ns.hitLimit = 2');
    });
  });

  it('setDryRunValue should set strykerDryRun to on globalThis', async () => {
    await setDryRunValue(true);
    await fs.readFile(setupFiles.dryRun, 'utf8').then((data) => {
      expect(data).to.contain('globalThis.strykerDryRun = true');
    });
  });

  it('setActiveMutant with setInBeforeEach true should set activeMutant in vitest before each', async () => {
    await setActiveMutant(factory.mutant({ id: '1' }), true, '__stryker__');
    await fs.readFile(setupFiles.activeMutant, 'utf8').then((data) => {
      expect(data).to.contain('beforeEach(() => {');
      expect(data).to.contain('const ns = globalThis.__stryker__ || (globalThis.__stryker__ = {});');
      expect(data).to.contain("ns.activeMutant = '1'");
    });
  });

  it('setActiveMutant with setInBeforeEach false should set activeMutant without vitest before each', async () => {
    await setActiveMutant(factory.mutant({ id: '1' }), false, '__stryker__');
    await fs.readFile(setupFiles.activeMutant, 'utf8').then((data) => {
      expect(data).to.contain('(function (ns) {');
      expect(data).to.contain("ns.activeMutant = '1'");
      expect(data).to.contain('})(globalThis.__stryker__ || (globalThis.__stryker__ = {}))');
    });
  });
});
