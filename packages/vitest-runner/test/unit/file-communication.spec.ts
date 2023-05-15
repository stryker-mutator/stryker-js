import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { syncBuiltinESMExports } from 'module';
import path from 'path';

import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { FileCommunicator } from '../../src/file-communicator.js';

describe(FileCommunicator.name, () => {
  let sut: FileCommunicator;
  let writeFileStub: sinon.SinonStubbedMember<typeof fs.writeFile>;
  let mkdirStub: sinon.SinonStubbedMember<typeof fs.mkdir>;

  beforeEach(() => {
    sut = new FileCommunicator('__stryker__');
    writeFileStub = sinon.stub(fs, 'writeFile');
    mkdirStub = sinon.stub(fs, 'mkdir');
    syncBuiltinESMExports();
  });

  const communicationDir = fileURLToPath(new URL('../../src/.vitest-runner-undefined', import.meta.url));

  function assertVitestSetupContains(containsText: string) {
    sinon.assert.calledOnceWithExactly(writeFileStub, sut.files.vitestSetup, sinon.match(containsText));
  }

  describe('files' satisfies keyof FileCommunicator, () => {
    it('should have the correct values', () => {
      expect(sut.files).to.deep.equal({
        coverage: path.resolve(communicationDir, '__stryker-coverage__.json').replace(/\\/g, '/'),
        hitCount: path.resolve(communicationDir, 'hitCount.txt').replace(/\\/g, '/'),
        vitestSetup: path.resolve(communicationDir, 'vitest.setup.js'),
      });
    });
    it('should be frozen', () => {
      expect(sut.files).frozen;
    });
  });

  describe(FileCommunicator.prototype.setDryRun.name, () => {
    it('should write activeMutant to undefined', async () => {
      await sut.setDryRun();
      assertVitestSetupContains('activeMutant = undefined;');
    });
    it('should use globalNamespace', async () => {
      await sut.setDryRun();
      assertVitestSetupContains('globalThis.__stryker__');
    });

    it('should write to coverage file', async () => {
      await sut.setDryRun();
      assertVitestSetupContains(`writeFile('${sut.files.coverage}'`);
    });

    it('should ensure the communication directory exists', async () => {
      await sut.setDryRun();
      sinon.assert.calledOnceWithExactly(mkdirStub, communicationDir, { recursive: true });
    });
  });

  describe(FileCommunicator.prototype.setMutantRun.name, () => {
    it('should use globalNamespace', async () => {
      await sut.setMutantRun(factory.mutantRunOptions());
      assertVitestSetupContains('globalThis.__stryker__');
    });

    it('should set active mutant without before if mutant is static', async () => {
      const id = '12345';
      await sut.setMutantRun(factory.mutantRunOptions({ mutantActivation: 'static', activeMutant: factory.mutant({ id }) }));
      const data = writeFileStub.firstCall.args[1] as string;
      const regex = /beforeEach\((.*)\);/gs;
      const beforeEachData = regex.exec(data);
      expect(beforeEachData).to.be.null;
      expect(data).to.contain(`ns.activeMutant = '${id}'`);
    });

    it('should set active mutant in before each if mutant is runtime', async () => {
      const id = '12345';
      await sut.setMutantRun(factory.mutantRunOptions({ mutantActivation: 'runtime', activeMutant: factory.mutant({ id }) }));
      const data = writeFileStub.firstCall.args[1] as string;
      const regex = /beforeEach\((.*)\);/gs;
      const beforeEachData = regex.exec(data);

      expect(beforeEachData).to.be.not.null;
      expect(beforeEachData![1]).to.contain(`ns.activeMutant = '${id}'`);
    });

    it('should ensure the communication directory exists', async () => {
      await sut.setMutantRun(factory.mutantRunOptions());
      sinon.assert.calledOnceWithExactly(mkdirStub, communicationDir, { recursive: true });
    });
  });
});
