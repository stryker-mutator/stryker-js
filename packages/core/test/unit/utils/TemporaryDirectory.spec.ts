import * as path from 'path';

import { commonTokens } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import * as sinon from 'sinon';

import * as fileUtils from '../../../src/utils/fileUtils';
import { TemporaryDirectory } from '../../../src/utils/TemporaryDirectory';

describe(TemporaryDirectory.name, () => {
  let randomStub: sinon.SinonStub;
  let deleteDirStub: sinon.SinonStub;
  let sut: TemporaryDirectory;
  const tempDirName = '.stryker-tmp';

  beforeEach(() => {
    sinon.stub(mkdirp, 'sync');
    sinon.stub(fsAsPromised, 'writeFile');
    deleteDirStub = sinon.stub(fileUtils, 'deleteDir');

    sut = createSut();

    randomStub = sinon.stub(sut, 'random');
    randomStub.returns('rand');
  });

  function createSut(): TemporaryDirectory {
    return testInjector.injector
      .provideValue(commonTokens.logger, factory.logger())
      .provideValue(commonTokens.options, factory.strykerOptions())
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
      it('should call deleteDir fileApi', async () => {
        const expectedPath = path.resolve(tempDirName);
        deleteDirStub.resolves('delResolveStub');

        const temporaryDirectoryInstance = sut;
        const result = temporaryDirectoryInstance.dispose();

        expect(fileUtils.deleteDir).calledWith(expectedPath);

        result.then(data => expect(data).equals('delResolveStub'));
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
