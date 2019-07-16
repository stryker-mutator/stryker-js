import * as sinon from 'sinon';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import { fsAsPromised } from '@stryker-mutator/util';
import { TemporaryDirectory } from '../../../src/utils/TemporaryDirectory';
import * as fileUtils from '../../../src/utils/fileUtils';

describe('TemporaryDirectory', () => {
  let sandbox: sinon.SinonSandbox;
  let cwdStub: sinon.SinonStub;
  let randomStub: sinon.SinonStub;
  let deleteDirStub: sinon.SinonStub;
  const mockCwd = '/x/y/z/some/dir';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    sinon.stub(mkdirp, 'sync');
    sinon.stub(fsAsPromised, 'writeFile');
    deleteDirStub = sinon.stub(fileUtils, 'deleteDir');
    cwdStub = sinon.stub(process, 'cwd');
    cwdStub.returns(mockCwd);
    randomStub = sinon.stub(TemporaryDirectory.instance(), 'random');
    randomStub.returns('rand');

    TemporaryDirectory.instance().baseTemporaryDirectory = '';
    TemporaryDirectory.instance().temporaryDirectory = '';
  });
  afterEach(() => sandbox.restore());

  describe('createRandomDirectory', () => {
    describe('when temp directory is initialized', () => {
      beforeEach(() => TemporaryDirectory.instance().initialize());
      it('should create dir with correct path', () => {
        const result = TemporaryDirectory.instance().createRandomDirectory('prefix');

        expect(mkdirp.sync).to.have.been.calledThrice;
        expect(result.includes('prefix')).to.be.true;
        expect(result.includes('rand')).to.be.true;
      });
    });
    describe('when temp directory is not initialized', () => {
      it('should throw error', () => {
        expect(() => {
          TemporaryDirectory.instance().createRandomDirectory('prefix');
        }).to.throw();
      });
    });
  });

  describe('clean', () => {
    describe('when temp directory is initialized', () => {
      beforeEach(() => TemporaryDirectory.instance().initialize());
      it('should call deleteDir fileApi', () => {
        deleteDirStub.resolves('delResolveStub');

        const temporaryDirectoryInstance = TemporaryDirectory.instance();
        const result = temporaryDirectoryInstance.clean();

        expect(fileUtils.deleteDir).to.have.been.calledWith(
          temporaryDirectoryInstance.baseTemporaryDirectory
        );

        result.then(data => expect(data).equals('delResolveStub'));
      });
    });

    describe('when temp directory is not initialized', () => {
      it('should throw error', () => {
        expect(() => {
          TemporaryDirectory.instance().createRandomDirectory('prefix');
        }).to.throw();
      });
    });
  });

});
