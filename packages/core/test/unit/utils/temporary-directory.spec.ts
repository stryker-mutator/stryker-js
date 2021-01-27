import path from 'path';
import fs from 'fs';

import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import mkdirp from 'mkdirp';
import sinon from 'sinon';

import { StrykerOptions } from '@stryker-mutator/api/core';

import * as fileUtils from '../../../src/utils/file-utils';
import * as objectUtils from '../../../src/utils/object-utils';
import { TemporaryDirectory } from '../../../src/utils/temporary-directory';

describe(TemporaryDirectory.name, () => {
  let randomStub: sinon.SinonStub;
  let deleteDirStub: sinon.SinonStub;
  let sut: TemporaryDirectory;
  const tempDirName = '.stryker-tmp';

  beforeEach(() => {
    sinon.stub(mkdirp, 'sync');
    sinon.stub(fs.promises, 'writeFile');
    deleteDirStub = sinon.stub(fileUtils, 'deleteDir');

    sut = createSut();

    randomStub = sinon.stub(objectUtils, 'random');
    randomStub.returns('rand');
  });

  function createSut(options?: Partial<StrykerOptions>): TemporaryDirectory {
    return testInjector.injector
      .provideValue(commonTokens.logger, factory.logger())
      .provideValue(commonTokens.options, factory.strykerOptions(options))
      .injectClass(TemporaryDirectory);
  }

  describe('createRandomDirectory', () => {
    describe('when temp directory is initialized', () => {
      beforeEach(() => sut.initialize());
      it('should create dir with correct path', () => {
        const result = sut.createRandomDirectory('prefix');

        expect(mkdirp.sync).to.have.been.calledTwice;
        expect(result.includes('prefix')).to.be.true;
        expect(result.includes('rand')).to.be.true;
      });
    });
    describe('when temp directory is not initialized', () => {
      it('should throw error', () => {
        expect(() => {
          sut.createRandomDirectory('prefix');
        }).to.throw();
      });
    });
  });

  describe('dispose', () => {
    describe('when temp directory is initialized', () => {
      beforeEach(() => sut.initialize());
      it('should remove the dir if cleanTempDir option is enabled', async () => {
        const expectedPath = path.resolve(tempDirName);
        deleteDirStub.resolves();
        const sut = createSut({ cleanTempDir: true });
        sut.initialize();
        await sut.dispose();
        expect(fileUtils.deleteDir).calledWith(expectedPath);
      });

      it('should not remove the dir if cleanTempDir option is enabled', async () => {
        const sut = createSut({ cleanTempDir: false });
        sut.initialize();
        await sut.dispose();
        expect(fileUtils.deleteDir).not.called;
      });

      it('should not remove the dir if `removeDuringDisposal` is set to false', async () => {
        const sut = createSut({ cleanTempDir: true });
        sut.initialize();
        sut.removeDuringDisposal = false;
        await sut.dispose();
        expect(fileUtils.deleteDir).not.called;
      });

      it('should remove the dir by default', async () => {
        deleteDirStub.resolves();
        await sut.dispose();
        expect(fileUtils.deleteDir).calledOnce;
      });
    });

    describe('when temp directory is not initialized', () => {
      it('should throw error', () => {
        expect(() => {
          sut.createRandomDirectory('prefix');
        }).to.throw();
      });
    });
  });
});
