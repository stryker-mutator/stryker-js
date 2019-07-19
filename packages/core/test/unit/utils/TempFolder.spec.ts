import * as sinon from 'sinon';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import { fsAsPromised } from '@stryker-mutator/util';
import { TemporaryDirectory } from '../../../src/utils/TemporaryDirectory';
import * as fileUtils from '../../../src/utils/fileUtils';
import { testInjector, factory } from '@stryker-mutator/test-helpers';
import { commonTokens } from '@stryker-mutator/api/plugin';

describe('TemporaryDirectory', () => {
  let sandbox: sinon.SinonSandbox;
  let cwdStub: sinon.SinonStub;
  let randomStub: sinon.SinonStub;
  let deleteDirStub: sinon.SinonStub;
  let sut: TemporaryDirectory;
  const mockCwd = '/x/y/z/some/dir';
  const tempDirName = '.stryker-tmp';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    sinon.stub(mkdirp, 'sync');
    sinon.stub(fsAsPromised, 'writeFile');
    deleteDirStub = sinon.stub(fileUtils, 'deleteDir');
    cwdStub = sinon.stub(process, 'cwd');
    cwdStub.returns(mockCwd);

    sut = createSut();

    randomStub = sinon.stub(sut, 'random');
    randomStub.returns('rand');
  });
  afterEach(() => sandbox.restore());

  function createSut(): TemporaryDirectory {
    return testInjector.injector
      .provideValue(commonTokens.logger, factory.logger())
      .provideValue(commonTokens.options, factory.strykerOptions({
        tempDirName
      }))
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
      it('should call deleteDir fileApi', () => {
        deleteDirStub.resolves('delResolveStub');

        const temporaryDirectoryInstance = sut;
        const result = temporaryDirectoryInstance.dispose();

        expect(fileUtils.deleteDir).to.have.been.calledWith(`${mockCwd}/${tempDirName}`);

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
