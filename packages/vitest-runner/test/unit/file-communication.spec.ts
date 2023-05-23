import fs from 'fs/promises';
import { syncBuiltinESMExports } from 'module';
import path from 'path';

import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { normalizeFileName } from '@stryker-mutator/util';

import { FileCommunicator } from '../../src/file-communicator.js';

describe(FileCommunicator.name, () => {
  let sut: FileCommunicator;
  let writeFileStub: sinon.SinonStubbedMember<typeof fs.writeFile>;
  let mkdirStub: sinon.SinonStubbedMember<typeof fs.mkdir>;
  let rmStub: sinon.SinonStubbedMember<typeof fs.rm>;

  beforeEach(() => {
    sut = new FileCommunicator('__stryker__');
    writeFileStub = sinon.stub(fs, 'writeFile');
    mkdirStub = sinon.stub(fs, 'mkdir');
    rmStub = sinon.stub(fs, 'rm');
    syncBuiltinESMExports();
  });

  const communicationDir = path.resolve(`.vitest-runner-${process.env.STRYKER_MUTATOR_WORKER}`);

  function assertVitestSetupContains(containsText: string) {
    sinon.assert.calledOnceWithExactly(writeFileStub, sut.files.vitestSetup, sinon.match(containsText));
  }

  describe('files' satisfies keyof FileCommunicator, () => {
    it('should have the correct values', () => {
      expect(sut.files).to.deep.equal({
        coverageDir: normalizeFileName(path.resolve(communicationDir, 'coverage')),
        hitCountDir: normalizeFileName(path.resolve(communicationDir, 'hitCount')),
        vitestSetup: normalizeFileName(path.resolve(communicationDir, 'vitest.setup.js')),
      } satisfies typeof sut.files);
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
      assertVitestSetupContains(
        `fs.writeFile(path.resolve('${sut.files.coverageDir}', String(suite.projectName)), JSON.stringify(ns.mutantCoverage ?? { perTest: {}, static: {}}))`
      );
    });

    it('should clean the communication directory', async () => {
      await sut.setDryRun();
      sinon.assert.calledOnceWithExactly(rmStub, communicationDir, { recursive: true, force: true });
      sinon.assert.calledWithExactly(mkdirStub, sut.files.coverageDir, { recursive: true });
      sinon.assert.calledWithExactly(mkdirStub, sut.files.hitCountDir, { recursive: true });
      sinon.assert.callOrder(rmStub, mkdirStub, mkdirStub);
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

    it('should clean the communication directory', async () => {
      await sut.setMutantRun(factory.mutantRunOptions());
      sinon.assert.calledOnceWithExactly(rmStub, communicationDir, { recursive: true, force: true });
      sinon.assert.calledWithExactly(mkdirStub, sut.files.coverageDir, { recursive: true });
      sinon.assert.calledWithExactly(mkdirStub, sut.files.hitCountDir, { recursive: true });
      sinon.assert.callOrder(rmStub, mkdirStub, mkdirStub);
    });
  });
});
