import path from 'path';
import fs from 'fs';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

import { TemporaryDirectory } from '../../../src/utils/temporary-directory.js';
import { expect } from 'chai';

describe(TemporaryDirectory.name, () => {
  let mkdtempStub: sinon.SinonStubbedMember<typeof fs.promises.mkdtemp>;
  let rmStub: sinon.SinonStubbedMember<typeof fs.promises.rm>;
  let mkdirStub: sinon.SinonStubbedMember<(typeof fs.promises)['mkdir']>;
  let readdirStub: sinon.SinonStubbedMember<typeof fs.promises.readdir>;
  let rmdirStub: sinon.SinonStubbedMember<typeof fs.promises.rmdir>;
  const tempDirName = '.stryker-tmp';
  const sandboxPath = path.resolve(tempDirName, 'sandbox-123');

  beforeEach(() => {
    mkdirStub = sinon.stub(fs.promises, 'mkdir');
    sinon.stub(fs.promises, 'writeFile');
    rmStub = sinon.stub(fs.promises, 'rm');
    mkdtempStub = sinon.stub(fs.promises, 'mkdtemp');
    readdirStub = sinon.stub(fs.promises, 'readdir');
    rmdirStub = sinon.stub(fs.promises, 'rmdir');
    readdirStub.resolves([]);
    mkdtempStub.resolves(path.resolve(tempDirName, 'sandbox-123'));
  });

  function createSut(options?: Partial<StrykerOptions>): TemporaryDirectory {
    return testInjector.injector.provideValue(commonTokens.options, factory.strykerOptions(options)).injectClass(TemporaryDirectory);
  }

  describe(TemporaryDirectory.prototype.initialize.name, () => {
    it('should create the .stryker-tmp directory', async () => {
      const sut = createSut();
      await sut.initialize();
      sinon.assert.calledWithExactly(mkdirStub, path.resolve(tempDirName), { recursive: true });
    });

    it('should create a sandbox directory', async () => {
      const sut = createSut();
      await sut.initialize();
      sinon.assert.calledWithExactly(mkdtempStub, path.resolve(tempDirName, 'sandbox-'));
    });

    it('should create a backup directory when `inPlace` is set', async () => {
      const sut = createSut({ inPlace: true });
      await sut.initialize();
      sinon.assert.calledWithExactly(mkdtempStub, path.resolve(tempDirName, 'backup-'));
    });
  });

  describe('path', () => {
    it('should return the path when initialized', async () => {
      const sut = createSut();
      await sut.initialize();
      expect(sut.path).to.equal(sandboxPath);
    });

    it('should throw an error when the path is requested before initialization', () => {
      const sut = createSut();
      expect(() => sut.path).to.throw('initialize() was not called!');
    });
  });

  describe('dispose', () => {
    it('should remove the dir if cleanTempDir option is true', async () => {
      rmStub.resolves();
      const sut = createSut({ cleanTempDir: true });
      await sut.initialize();
      await sut.dispose();
      sinon.assert.calledWithExactly(rmStub, sandboxPath, { recursive: true, force: true });
    });

    it("should remove the dir if cleanTempDir option is 'always'", async () => {
      rmStub.resolves();
      const sut = createSut({ cleanTempDir: 'always' });
      await sut.initialize();
      await sut.dispose();
      sinon.assert.calledWithExactly(rmStub, sandboxPath, { recursive: true, force: true });
    });

    it('should not remove the dir if cleanTempDir option is enabled', async () => {
      const sut = createSut({ cleanTempDir: false });
      await sut.initialize();
      await sut.dispose();
      sinon.assert.notCalled(rmStub);
    });

    it('should not remove the dir if `removeDuringDisposal` is set to false', async () => {
      const sut = createSut({ cleanTempDir: true });
      await sut.initialize();
      sut.removeDuringDisposal = false;
      await sut.dispose();
      sinon.assert.notCalled(rmStub);
    });

    it('should remove the dir by default', async () => {
      const sut = createSut();
      await sut.initialize();
      rmStub.resolves();
      await sut.dispose();
      sinon.assert.calledOnce(rmStub);
    });

    it('should also remove the parent directory if it is empty', async () => {
      const sut = createSut();
      await sut.initialize();
      rmStub.resolves();
      readdirStub.resolves([]);
      await sut.dispose();
      sinon.assert.calledWithExactly(rmdirStub, tempDirName);
    });

    it('should log any errors on debug when failing to remove the parent directory', async () => {
      const sut = createSut();
      await sut.initialize();
      rmStub.resolves();
      readdirStub.resolves([]);
      const expectedError = new Error('foo bar');
      rmdirStub.rejects(expectedError);
      await sut.dispose();
      sinon.assert.calledWithExactly(testInjector.logger.debug, 'Failed to clean temp .stryker-tmp', expectedError);
    });

    it("should not remove the parent directory if it isn't empty", async () => {
      const sut = createSut();
      await sut.initialize();
      rmStub.resolves();
      readdirStub.resolves(['sandbox-798'] as unknown as fs.Dirent[]);
      await sut.dispose();
      sinon.assert.notCalled(rmdirStub);
    });

    it('should do nothing when temp directory was not initialized', async () => {
      const sut = createSut();
      await sut.dispose();
      sinon.assert.notCalled(rmStub);
    });
  });
});
