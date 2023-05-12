import fs from 'fs/promises';

import { TempTestDirectorySandbox, factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';

import { FileCommunicator } from '../../src/file-communicator.js';

describe(FileCommunicator.name, () => {
  let sandbox: TempTestDirectorySandbox;
  let sut: FileCommunicator;
  const globalStrykerNamespace = '__stryker2__';

  beforeEach(async () => {
    sandbox = new TempTestDirectorySandbox('file-communication');
    await sandbox.init();
    sut = new FileCommunicator(globalStrykerNamespace);
  });

  afterEach(async () => {
    await sandbox.dispose();
  });

  it('setDryRun should write activeMutant to undefined', async () => {
    await sut.setDryRun();
    const data = await fs.readFile(sut.files.vitestSetup, 'utf8');
    expect(data).to.contain('activeMutant = undefined;');
  });

  it('setDryRun should use globalNamespace', async () => {
    await sut.setDryRun();
    const data = await fs.readFile(sut.files.vitestSetup, 'utf8');
    expect(data).to.contain(`globalThis.${globalStrykerNamespace}`);
  });

  it('setDryRun should write to coverage file', async () => {
    await sut.setDryRun();
    const data = await fs.readFile(sut.files.vitestSetup, 'utf8');
    expect(data).to.contain(`writeFile('${sut.files.coverage}',`);
  });

  it('setMutantRun should use globalNamespace', async () => {
    await sut.setMutantRun(factory.mutantRunOptions());
    const data = await fs.readFile(sut.files.vitestSetup, 'utf8');
    expect(data).to.contain(`globalThis.${globalStrykerNamespace}`);
  });

  it('setMutantRun should set active mutant without before if mutant is static', async () => {
    const id = '12345';
    await sut.setMutantRun(factory.mutantRunOptions({ mutantActivation: 'static', activeMutant: factory.mutant({ id }) }));
    const data = await fs.readFile(sut.files.vitestSetup, 'utf8');
    const regex = /beforeEach\((.*)\);/gs;
    const beforeEachData = regex.exec(data);

    expect(beforeEachData).to.be.null;
    expect(data).to.contain(`ns.activeMutant = '${id}'`);
  });

  it('setMutantRun should set active mutant in before each if mutant is runtime', async () => {
    const id = '12345';
    await sut.setMutantRun(factory.mutantRunOptions({ mutantActivation: 'runtime', activeMutant: factory.mutant({ id }) }));
    const data = await fs.readFile(sut.files.vitestSetup, 'utf8');
    const regex = /beforeEach\((.*)\);/gs;
    const beforeEachData = regex.exec(data);

    expect(beforeEachData).to.be.not.null;
    expect(beforeEachData![1]).to.contain(`ns.activeMutant = '${id}'`);
  });
});
