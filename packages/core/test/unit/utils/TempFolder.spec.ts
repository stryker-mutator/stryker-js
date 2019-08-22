import { fsAsPromised } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import * as sinon from 'sinon';
import * as fileUtils from '../../../src/utils/fileUtils';
import { TempFolder } from '../../../src/utils/TempFolder';

describe('TempFolder', () => {
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
    randomStub = sinon.stub(TempFolder.instance(), 'random');
    randomStub.returns('rand');

    TempFolder.instance().baseTempFolder = '';
    TempFolder.instance().tempFolder = '';
  });
  afterEach(() => sandbox.restore());

  describe('createRandomFolder', () => {
    describe('when temp folder is initialized', () => {
      beforeEach(() => TempFolder.instance().initialize());
      it('should create dir with correct path', () => {
        const result = TempFolder.instance().createRandomFolder('prefix');

        expect(mkdirp.sync).to.have.been.calledThrice;
        expect(result.includes('prefix')).to.be.true;
        expect(result.includes('rand')).to.be.true;
      });
    });
    describe('when temp folder is not initialized', () => {
      it('should throw error', () => {
        expect(() => {
          TempFolder.instance().createRandomFolder('prefix');
        }).to.throw();
      });
    });
  });

  describe('clean', () => {
    describe('when temp folder is initialized', () => {
      beforeEach(() => TempFolder.instance().initialize());
      it('should call deleteDir fileApi', () => {
        deleteDirStub.resolves('delResolveStub');

        const tempFolderInstance = TempFolder.instance();
        const result = tempFolderInstance.clean();

        expect(fileUtils.deleteDir).to.have.been.calledWith(
          tempFolderInstance.baseTempFolder
        );

        result.then(data => expect(data).equals('delResolveStub'));
      });
    });

    describe('when temp folder is not initialized', () => {
      it('should throw error', () => {
        expect(() => {
          TempFolder.instance().createRandomFolder('prefix');
        }).to.throw();
      });
    });
  });

});
