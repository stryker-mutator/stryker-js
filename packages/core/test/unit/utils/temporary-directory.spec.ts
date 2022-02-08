import path from 'path';
import fs from 'fs';

import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { StrykerOptions } from '@stryker-mutator/api/core';

import { fileUtils } from '../../../src/utils/file-utils.js';
import { objectUtils } from '../../../src/utils/object-utils.js';
import { TemporaryDirectory } from '../../../src/utils/temporary-directory.js';

describe(TemporaryDirectory.name, () => {
  let randomStub: sinon.SinonStubbedMember<typeof objectUtils.random>;
  let deleteDirStub: sinon.SinonStub;
  let mkdirpStub: sinon.SinonStubbedMember<typeof fileUtils.mkdirp>;
  const tempDirName = '.stryker-tmp';

  beforeEach(() => {
    mkdirpStub = sinon.stub(fileUtils, 'mkdirp');
    sinon.stub(fs.promises, 'writeFile');
    deleteDirStub = sinon.stub(fileUtils, 'deleteDir');
    randomStub = sinon.stub(objectUtils, 'random');
  });

  function createSut(options?: Partial<StrykerOptions>): TemporaryDirectory {
    return testInjector.injector
      .provideValue(commonTokens.logger, factory.logger())
      .provideValue(commonTokens.options, factory.strykerOptions(options))
      .injectClass(TemporaryDirectory);
  }

  describe(TemporaryDirectory.prototype.getRandomDirectory.name, () => {
    it('should return a random directory with provided prefix', () => {
      const sut = createSut();
      randomStub.returns(126891);
      expect(sut.getRandomDirectory('stryker-prefix-')).eq(path.resolve(tempDirName, 'stryker-prefix-126891'));
    });
  });

  describe(TemporaryDirectory.prototype.createDirectory.name, () => {
    it('should create dir with correct path', async () => {
      const sut = createSut();
      await sut.initialize();
      await sut.createDirectory('some-dir');

      sinon.assert.calledTwice(mkdirpStub);
      sinon.assert.calledWith(mkdirpStub, path.resolve(tempDirName, 'some-dir'));
    });
    it('should reject when temp directory is not initialized', async () => {
      const sut = createSut();
      await expect(sut.createDirectory('some-dir')).rejected;
    });
  });

  describe('dispose', () => {
    it('should remove the dir if cleanTempDir option is enabled', async () => {
      const expectedPath = path.resolve(tempDirName);
      deleteDirStub.resolves();
      const sut = createSut({ cleanTempDir: true });
      await sut.initialize();
      await sut.dispose();
      expect(fileUtils.deleteDir).calledWith(expectedPath);
    });

    it('should not remove the dir if cleanTempDir option is enabled', async () => {
      const sut = createSut({ cleanTempDir: false });
      await sut.initialize();
      await sut.dispose();
      expect(fileUtils.deleteDir).not.called;
    });

    it('should not remove the dir if `removeDuringDisposal` is set to false', async () => {
      const sut = createSut({ cleanTempDir: true });
      await sut.initialize();
      sut.removeDuringDisposal = false;
      await sut.dispose();
      expect(fileUtils.deleteDir).not.called;
    });

    it('should remove the dir by default', async () => {
      const sut = createSut();
      await sut.initialize();
      deleteDirStub.resolves();
      await sut.dispose();
      expect(fileUtils.deleteDir).calledOnce;
    });

    it('should reject when temp directory is not initialized', async () => {
      const sut = createSut();
      await expect(sut.dispose()).rejected;
    });
  });
});
