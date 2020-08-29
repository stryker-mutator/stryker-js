import * as path from 'path';
import * as fs from 'fs';

import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import * as sinon from 'sinon';

import { StrykerOptions } from '@stryker-mutator/api/core';

import * as fileUtils from '../../../src/utils/fileUtils';
import { TemporaryDirectory } from '../../../src/utils/TemporaryDirectory';

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

    randomStub = sinon.stub(sut, 'random');
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
      it('should call deleteDir fileApi if cleanTempDir option is enabled', async () => {
        const expectedPath = path.resolve(tempDirName);
        deleteDirStub.resolves();

        const temporaryDirectoryInstance = createSut({ cleanTempDir: true });
        temporaryDirectoryInstance.initialize();
        await temporaryDirectoryInstance.dispose();

        expect(fileUtils.deleteDir).calledWith(expectedPath);
      });

      it('should not call deleteDir fileApi by default', async () => {
        deleteDirStub.resolves();

        const temporaryDirectoryInstance = sut;
        await temporaryDirectoryInstance.dispose();

        expect(fileUtils.deleteDir).callCount(0);
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
