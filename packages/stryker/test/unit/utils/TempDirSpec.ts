import * as sinon from 'sinon';
import { expect } from 'chai';
import * as mkdirp from 'mkdirp';
import * as fs from 'mz/fs';
import { TempDir } from '../../../src/utils/TempDir';
import * as fileUtils from '../../../src/utils/fileUtils';

describe('tempDir', () => {
  let sandbox: sinon.SinonSandbox;
  let cwdStub: sinon.SinonStub;
  let randomStub: sinon.SinonStub;
  let deleteDirStub: sinon.SinonStub;
  const mockCwd = '/x/y/z/some/dir';
  const nameTempDir = '.stryker-tmp';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    
    sandbox.stub(mkdirp, 'sync');
    sandbox.stub(fs, 'writeFile');
    deleteDirStub = sandbox.stub(fileUtils, 'deleteDir');
    cwdStub = sandbox.stub(process, 'cwd');
    cwdStub.returns(mockCwd);
    randomStub = sandbox.stub(TempDir.instance(), 'random');
    randomStub.returns('rand');

    TempDir.instance().baseTempFolder = '';
    TempDir.instance().tempFolder = '';
  });
  afterEach(() => sandbox.restore());

  describe('createRandomFolder', () => {
    describe('when temp folder is initialized', () => {
      beforeEach(() => TempDir.instance().initialize(nameTempDir));
      it('should create dir with correct path', () => {
        const result = TempDir.instance().createRandomFolder('prefix');

        expect(mkdirp.sync).to.have.been.calledThrice;
        expect(result.includes('prefix')).to.be.true;
        expect(result.includes('rand')).to.be.true;
      });
    });
    describe('when temp folder is not initialized', () => {
      it('should throw error', () => {
        expect(() => {
          TempDir.instance().createRandomFolder('prefix');
        }).to.throw();
      });
    });
  });

  describe('clean', () => {
    describe('when temp folder is initialized', () => {
      beforeEach(() => { 
        TempDir.instance().initialize(nameTempDir);
      });

      it('should call deleteDir fileApi', async () => {
        deleteDirStub.resolves('delResolveStub');

        const tempFolderInstance = TempDir.instance();
        const result = await tempFolderInstance.clean();

        expect(fileUtils.deleteDir).to.have.been.calledWith(
          tempFolderInstance.baseTempFolder
        );

        expect(result).equals('delResolveStub');
      });
    });

    describe('when temp folder is not initialized', () => {
      it('should throw error', () => {
        expect(() => {
          TempDir.instance().createRandomFolder('prefix');
        }).to.throw();
      });
    });
  });

});