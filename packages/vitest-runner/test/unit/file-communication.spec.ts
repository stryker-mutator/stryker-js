import fs from 'fs/promises';
import { syncBuiltinESMExports } from 'module';
import path from 'path';

import sinon from 'sinon';
import { expect } from 'chai';
import { normalizeFileName, normalizeWhitespaces } from '@stryker-mutator/util';
import { factory } from '@stryker-mutator/test-helpers';

import { FileCommunicator } from '../../src/file-communicator.js';

describe(FileCommunicator.name, () => {
  let sut: FileCommunicator;
  let writeFileStub: sinon.SinonStubbedMember<typeof fs.writeFile>;

  beforeEach(() => {
    sut = new FileCommunicator('__stryker__');
    writeFileStub = sinon.stub(fs, 'writeFile');
    syncBuiltinESMExports();
  });

  const setupFile = normalizeFileName(path.resolve(`.'vitest.${process.env.STRYKER_MUTATOR_WORKER}.setup.js`));

  function assertVitestSetupContains(containsText: string) {
    sinon.assert.calledOnceWithExactly(writeFileStub, sut.vitestSetup, sinon.match.string);
    const file = writeFileStub.firstCall.args[1] as string;
    expect(normalizeWhitespaces(file)).to.contain(normalizeWhitespaces(containsText));
  }

  it('should have make the setupFile worker dependent', () => {
    expect(sut.vitestSetup).eq(setupFile);
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

    it('should report mutant coverage in afterAll', async () => {
      await sut.setDryRun();
      assertVitestSetupContains(
        `afterAll(async (suite) => {
          suite.meta.mutantCoverage = ns.mutantCoverage;
        })`
      );
    });
  });

  describe(FileCommunicator.prototype.setMutantRun.name, () => {
    it('should use globalNamespace', async () => {
      await sut.setMutantRun(factory.mutantRunOptions());
      assertVitestSetupContains('globalThis.__stryker__');
    });

    it('should set active mutant without before if mutant is static', async () => {
      await sut.setMutantRun(factory.mutantRunOptions({ mutantActivation: 'static', activeMutant: factory.mutant({ id: '12345' }) }));
      const data = writeFileStub.firstCall.args[1] as string;
      expect(/beforeEach\((.*)\);/gs.exec(data)).to.be.null;
      assertVitestSetupContains("ns.activeMutant = '12345'");
    });

    it('should set active mutant in before each if mutant is runtime', async () => {
      await sut.setMutantRun(factory.mutantRunOptions({ mutantActivation: 'runtime', activeMutant: factory.mutant({ id: '12345' }) }));
      assertVitestSetupContains(`beforeEach(() => {
        ns.activeMutant = '12345';
      })`);
    });

    it('should report the hitCount in afterAll', async () => {
      await sut.setMutantRun(factory.mutantRunOptions());
      assertVitestSetupContains(
        `afterAll(async (suite) => {
          suite.meta.hitCount = ns.hitCount;
        })`
      );
    });
  });
});
